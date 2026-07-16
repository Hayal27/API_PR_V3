const con = require("../models/db");

// UPDATED ANALYTICS FILE - COMPLETED PLANS FILTER ACTIVE
console.log("🔄 ANALYTICS.JS LOADED - FILTERING FOR COMPLETED PLANS ONLY");

// Handles database errors by responding with HTTP 500 and logging the error
const handleDatabaseError = (err, res, operation) => {
  console.error(`Error during ${operation}:`, err);
  return res.status(500).json({
    message: `Error during ${operation}`,
    error: err.message,
    code: err.code
  });
};

// Handles cases when the query returns empty results, respond with a 404
//Middleware to handle empty results
const handleEmptyResults = (results, res, defaultValues) => {
  if (!results || results.length === 0) {
    res.json(defaultValues);
    return true;
  }
  return false;
};
// Builds the join clause based on the request parameters
const getJoinClause = (req) => {
  let joinClause = BASE_JOIN;
  // No need to add additional JOIN for plans table since it's already included in BASE_JOIN
  // The department filtering is handled in getFilterConditions function
  return joinClause;
};




// Validate period parameters from the query
const validatePeriodParams = (req, res) => {
  const { year, quarter } = req.query;
  if (!year || !quarter) {
    res.status(400).json({
      message: "Year and quarter are required parameters"
    });
    return false;
  }
  return true;
};

// const handleEmptyResults = (results, res, defaultValue = null) => {
//   if (!results || results.length === 0) {
//     return res.status(404).json({
//       message: "No data found for the specified criteria",
//       data: defaultValue
//     });
//   }
//   return false;
// };

// Base JOIN clause for proper table relationships (always included joins)
// Updated to include approvalworkflow table and filter for completed plans only
// FIXED: Use correct column name specific_objective_detail_id (singular) on both sides
const BASE_JOIN = `
  FROM specific_objective_details sod
  JOIN specific_objectives so ON sod.specific_objective_id = so.specific_objective_id
  JOIN objectives o ON so.objective_id = o.objective_id
  JOIN goals g ON o.goal_id = g.goal_id
  JOIN plans p ON p.specific_objective_detail_id = sod.specific_objective_detail_id
  JOIN approvalworkflow aw ON p.plan_id = aw.plan_id
  WHERE aw.status = 'completed'
  AND aw.comment NOT LIKE 'REFERRED by %'
  AND aw.comment NOT LIKE 'Referred from %'`;

const getFilterConditions = (req) => {
  const conditions = [];

  if (req.query.year) {
    conditions.push(`g.year = '${req.query.year}'`);
  }

  // Fix: Check for specific_objective_name to make it consistent with the query value sent by the client.
  if (req.query.specific_objective_name) {
    conditions.push(`so.specific_objective_name = '${req.query.specific_objective_name}'`);
  }

  // Check for a valid year_range format (e.g., "2020-2023")
  if (req.query.year_range) {
    const years = req.query.year_range.split('-');
    if (years.length === 2) {
      conditions.push(`g.year BETWEEN '${years[0]}' AND '${years[1]}'`);
    }
  }

  if (req.query.quarter) {
    conditions.push(`g.quarter = '${req.query.quarter}'`);
  }

  // Modify the department filter to use sod.department_id with recursive cascading
  if (req.query.department) {
    conditions.push(`sod.department_id IN (
      SELECT id FROM (
        WITH RECURSIVE children AS (
          SELECT id FROM organization_structure WHERE id = '${req.query.department}'
          UNION ALL
          SELECT os.id FROM organization_structure os
          INNER JOIN children c ON os.parent_id = c.id
        )
        SELECT id FROM children
      ) as child_units
    )`);
  }

  if (req.query.created_by) {
    conditions.push(`sod.created_by = '${req.query.created_by}'`);
  }

  if (req.query.view) {
    conditions.push(`so.view = '${req.query.view}'`);
  }

  if (req.query.plan_type) {
    conditions.push(`sod.plan_type = '${req.query.plan_type}'`);
  }

  if (req.query.cost_type) {
    conditions.push(`sod.cost_type = '${req.query.cost_type}'`);
  }

  if (req.query.income_plan_type) {
    conditions.push(`sod.income_plan_type = '${req.query.income_plan_type}'`);
  }

  if (req.query.project_type) {
    conditions.push(`sod.project_type = '${req.query.project_type}'`);
  }

  if (req.query.employment_type) {
    conditions.push(`sod.employment_type = '${req.query.employment_type}'`);
  }

  return conditions.length > 0 ? " AND " + conditions.join(" AND ") : "";
};

// Display Total Cost (summing CIoutcome) with additional filters
const displayTotalCost = async (req, res) => {
  try {
    const joinClause = getJoinClause(req);
    const extraFilters = getFilterConditions(req);
    const query = `
      SELECT COALESCE(SUM(sod.CIoutcome), 0) as total_cost
      ${joinClause}
      AND sod.plan_type = 'cost' ${extraFilters}
    `;
    con.query(query, (err, results) => {
      if (err) return handleDatabaseError(err, res, 'fetching total cost');
      if (handleEmptyResults(results, res, { total_cost: 0 })) return;
      res.json(results[0].total_cost);
    });
  } catch (error) {
    console.error('Unexpected error in displayTotalCost:', error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Updated function: Display Total Cost Plan (summing CIplan) with additional filters
const displayTotalCostPlan = async (req, res) => {
  try {
    const joinClause = getJoinClause(req);
    const extraFilters = getFilterConditions(req);
    const query = `
      SELECT COALESCE(SUM(sod.CIplan), 0) as total_cost_plan
      ${joinClause}
      AND sod.plan_type = 'cost' ${extraFilters}
    `;
    con.query(query, (err, results) => {
      if (err) return handleDatabaseError(err, res, 'fetching total cost plan');
      if (handleEmptyResults(results, res, { total_cost_plan: 0 })) return;
      res.json(results[0].total_cost_plan);
    });
  } catch (error) {
    console.error('Unexpected error in displayTotalCostPlan:', error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Updated function: Compare Total Cost Plan (CIplan) and CI Outcome (CIoutcome) with additional filters

const compareCostPlanOutcome = async (req, res) => {
  try {
    const joinClause = getJoinClause(req);
    const extraFilters = getFilterConditions(req);
    const query = `
      SELECT 
        sod.department_id,
        sod.description,
        COALESCE(SUM(CASE WHEN sod.plan_type = 'cost' THEN sod.CIplan END), 0) as total_cost_plan,
        COALESCE(SUM(CASE WHEN sod.plan_type = 'cost' THEN sod.CIoutcome END), 0) as total_cost_outcome,
        COALESCE(SUM(CASE WHEN sod.plan_type = 'cost' THEN sod.CIplan END), 0) - COALESCE(SUM(CASE WHEN sod.plan_type = 'cost' THEN sod.CIoutcome END), 0) as difference,
        CASE 
          WHEN COALESCE(SUM(CASE WHEN sod.plan_type = 'cost' THEN sod.CIplan END), 0) = 0 THEN 0
          ELSE (COALESCE(SUM(CASE WHEN sod.plan_type = 'cost' THEN sod.CIoutcome END), 0) / COALESCE(SUM(CASE WHEN sod.plan_type = 'cost' THEN sod.CIplan END), 0)) * 100
        END as excution_persentage
      ${joinClause}
      AND sod.plan_type = 'cost' ${extraFilters}
      GROUP BY sod.department_id, sod.description
    `;

    con.query(query, (err, results) => {
      if (err) return handleDatabaseError(err, res, 'comparing cost plan and outcome');

      if (handleEmptyResults(results, res, {
        total_cost_plan: 0,
        total_cost_outcome: 0,
        difference: 0,
        excution_persentage: 0
      })) return;

      res.json(results);
    });
  } catch (error) {
    console.error('Unexpected error in compareCostPlanOutcome:', error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};






// costPlan_Outcome_difference_regular_budget
const costPlanOutcomeDifferenceRegularBudget = async (req, res) => {
  try {
    // Retrieve joinClause and extraFilters from the request.
    // Using getJoinClause which returns the BASE_JOIN already.
    let joinClause = getJoinClause(req);
    const extraFilters = getFilterConditions(req) || "";

    // If joinClause is missing a FROM clause, fallback to the BASE_JOIN.
    if (!joinClause || !/FROM\s+/i.test(joinClause)) {
      joinClause = BASE_JOIN;
      console.warn("joinClause not provided or missing FROM clause; using default BASE_JOIN");
    }

    // Build the SQL query string. This groups rows by costName.
    // No extra join is appended here.
    const query = `
      SELECT 
        sod.costName,
        COALESCE(SUM(CASE WHEN sod.plan_type = 'cost' THEN sod.CIplan END), 0) AS plan,
        COALESCE(SUM(CASE WHEN sod.plan_type = 'cost' THEN sod.CIoutcome END), 0) AS outcome,
        COALESCE(SUM(CASE WHEN sod.plan_type = 'cost' THEN sod.CIplan END), 0) - COALESCE(SUM(CASE WHEN sod.plan_type = 'cost' THEN sod.CIoutcome END), 0) AS difference
      ${joinClause}
      AND sod.plan_type = 'cost' AND 
        sod.cost_type = 'regular_budget' ${extraFilters}
      GROUP BY sod.costName
    `;

    console.log("Constructed Query:", query);

    con.query(query, (err, results) => {
      if (err) {
        console.error("Database error occurred:", err);
        return handleDatabaseError(err, res, "comparing cost plan and outcome total_regular");
      }

      // Check if the results are empty. If so, return default structured response.
      if (handleEmptyResults(results, res, { data: [], totals: { plan: 0, outcome: 0, difference: 0 } })) {
        return;
      }

      // Log the raw SQL results for debugging purposes.
      console.log("SQL Query Results:", results);

      // Compute overall totals by iterating over the grouped results.
      let totalPlan = 0;
      let totalOutcome = 0;
      results.forEach(row => {
        totalPlan += Number(row.plan);
        totalOutcome += Number(row.outcome);
      });
      const totalDifference = totalPlan - totalOutcome;

      // Build the final response object.
      const responseData = {
        data: results, // array of { costName, plan, outcome, difference }
        totals: {
          plan: totalPlan,
          outcome: totalOutcome,
          difference: totalDifference
        }
      };

      // Log computed totals.
      console.log("Computed Totals - Total Plan:", totalPlan, "Total Outcome:", totalOutcome, "Total Difference:", totalDifference);

      // Send the computed data to the frontend.
      res.json(responseData);
    });

  } catch (error) {
    console.error("Unexpected error in costPlanOutcomeDifferenceRegularBudget:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


const costPlanOutcomeDifferenceCapitalBudget = async (req, res) => {
  try {
    // Retrieve joinClause and extraFilters from the request.
    // Using getJoinClause which returns the BASE_JOIN already.
    let joinClause = getJoinClause(req);
    const extraFilters = getFilterConditions(req) || "";

    // If joinClause is missing a FROM clause, fallback to the BASE_JOIN.
    if (!joinClause || !/FROM\s+/i.test(joinClause)) {
      joinClause = BASE_JOIN;
      console.warn("joinClause not provided or missing FROM clause; using default BASE_JOIN");
    }

    // Build the SQL query string. This groups rows by costName.
    // No extra join is appended here.
    const query = `
      SELECT 
        sod.costName,
        COALESCE(SUM(CASE WHEN sod.plan_type = 'cost' THEN sod.CIplan END), 0) AS plan,
        COALESCE(SUM(CASE WHEN sod.plan_type = 'cost' THEN sod.CIoutcome END), 0) AS outcome,
        COALESCE(SUM(CASE WHEN sod.plan_type = 'cost' THEN sod.CIplan END), 0) - COALESCE(SUM(CASE WHEN sod.plan_type = 'cost' THEN sod.CIoutcome END), 0) AS difference
      ${joinClause}
      AND sod.plan_type = 'cost' AND 
        sod.cost_type = 'capital_project_budget' ${extraFilters}
      GROUP BY sod.costName
    `;

    console.log("Constructed Query:", query);

    con.query(query, (err, results) => {
      if (err) {
        console.error("Database error occurred:", err);
        return handleDatabaseError(err, res, "comparing cost plan and outcome total_capital");
      }

      // Check if the results are empty. If so, return default structured response.
      if (handleEmptyResults(results, res, { data: [], totals: { plan: 0, outcome: 0, difference: 0 } })) {
        return;
      }

      // Log the raw SQL results for debugging purposes.
      console.log("SQL Query Results:", results);

      // Compute overall totals by iterating over the grouped results.
      let totalPlan = 0;
      let totalOutcome = 0;
      results.forEach(row => {
        totalPlan += Number(row.plan);
        totalOutcome += Number(row.outcome);
      });
      const totalDifference = totalPlan - totalOutcome;

      // Build the final response object.
      const responseData = {
        data: results, // array of { costName, plan, outcome, difference }
        totals: {
          plan: totalPlan,
          outcome: totalOutcome,
          difference: totalDifference
        }
      };

      // Log computed totals.
      console.log("Computed Totals - Total Plan:", totalPlan, "Total Outcome:", totalOutcome, "Total Difference:", totalDifference);

      // Send the computed data to the frontend.
      res.json(responseData);
    });

  } catch (error) {
    console.error("Unexpected error in costPlanOutcomeDifferenceCapitalBudget:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};





// Display execution_percentage of Cost
const displayTotalCostExcutionPercentage = async (req, res) => {
  try {
    const joinClause = getJoinClause(req);
    const extraFilters = getFilterConditions(req);
    const query = `
      SELECT COALESCE(AVG(sod.CIexecution_percentage), 0) AS average_cost_CIexecution_percentage
      ${joinClause}
      AND sod.plan_type = 'cost' ${extraFilters}
    `;
    con.query(query, (err, results) => {
      if (err) return handleDatabaseError(err, res, 'fetching average CIexecution_percentage');
      if (handleEmptyResults(results, res, { average_cost_CIexecution_percentage: 0 })) return;
      console.log('Fetched average cost execution percentage:', results[0].average_cost_CIexecution_percentage);
      res.json({ averageCostCIExecutionPercentage: results[0].average_cost_CIexecution_percentage });
    });
  } catch (error) {
    console.error('Unexpected error in displayTotalCostExcutionPercentage:', error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Display Total Income Plan USD (summing CIplan) with additional filters
const displayTotalIncomePlanUSD = async (req, res) => {
  try {
    const joinClause = getJoinClause(req);
    const extraFilters = getFilterConditions(req);
    const query = `
      SELECT COALESCE(SUM(sod.CIplan), 0) as total_income_plan_USD
      ${joinClause}
      AND sod.plan_type = 'income' AND sod.income_exchange = 'USD' ${extraFilters}
    `;
    con.query(query, (err, results) => {
      if (err) return handleDatabaseError(err, res, 'fetching total_income_plan_USD');
      if (handleEmptyResults(results, res, { total_income_plan_USD: 0 })) return;
      res.json(results[0].total_income_plan_USD);
    });
  } catch (error) {
    console.error('Unexpected error in displayTotalIncomePlanUSD:', error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Display Total Income Plan ETB (summing CIplan) with additional filters
const displayTotalIncomeplanETB = async (req, res) => {
  try {
    const joinClause = getJoinClause(req);
    const extraFilters = getFilterConditions(req);
    const query = `
      SELECT COALESCE(SUM(sod.CIplan), 0) as total_income_plan_ETB
      ${joinClause}
      AND sod.plan_type = 'income' AND sod.income_exchange = 'ETB' ${extraFilters}
    `;
    con.query(query, (err, results) => {
      if (err) return handleDatabaseError(err, res, 'fetching total_income_plan_ETB');
      if (handleEmptyResults(results, res, { total_income_plan_ETB: 0 })) return;
      res.json(results[0].total_income_plan_ETB);
    });
  } catch (error) {
    console.error('Unexpected error in displayTotalIncomeplanETB:', error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Display Total Income Outcome USD (summing CIoutcome) with additional filters
const displayTotalIncomeOutcomeUSD = async (req, res) => {
  try {
    const joinClause = getJoinClause(req);
    const extraFilters = getFilterConditions(req);
    const query = `
      SELECT COALESCE(SUM(sod.CIoutcome), 0) as total_income_outcome_USD
      ${joinClause}
      AND sod.plan_type = 'income' AND sod.income_exchange = 'USD' ${extraFilters}
    `;
    con.query(query, (err, results) => {
      if (err) return handleDatabaseError(err, res, 'fetching total_income_outcome_USD');
      if (handleEmptyResults(results, res, { total_income_outcome_USD: 0 })) return;
      res.json(results[0].total_income_outcome_USD);
    });
  } catch (error) {
    console.error('Unexpected error in displayTotalIncomeOutcomeUSD:', error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Display Total Income Outcome ETB (summing CIoutcome) with additional filters
const displayTotalIncomeOutcomeETB = async (req, res) => {
  try {
    const joinClause = getJoinClause(req);
    const extraFilters = getFilterConditions(req);
    const query = `
      SELECT COALESCE(SUM(sod.CIoutcome), 0) as total_income_outcome_ETB
      ${joinClause}
      AND sod.plan_type = 'income' AND sod.income_exchange = 'ETB' ${extraFilters}
    `;
    con.query(query, (err, results) => {
      if (err) return handleDatabaseError(err, res, 'fetching total_income_outcome_ETB');
      if (handleEmptyResults(results, res, { total_income_outcome_ETB: 0 })) return;
      res.json(results[0].total_income_outcome_ETB);
    });
  } catch (error) {
    console.error('Unexpected error in displayTotalIncomeOutcomeETB:', error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Compare Total Income Plan ETB with Total Income Outcome ETB using table, pie chart and bar chart
const compareIncomePlanOutcomeETB = async (req, res) => {
  try {
    const joinClause = getJoinClause(req);
    const extraFilters = getFilterConditions(req);
    const query = `
      SELECT 
        COALESCE(SUM(sod.CIplan), 0) as total_income_plan_ETB,
        COALESCE(SUM(sod.CIoutcome), 0) as total_income_outcome_ETB
      ${joinClause}
      AND sod.plan_type = 'income' AND sod.income_exchange = 'ETB' ${extraFilters}
    `;
    con.query(query, (err, results) => {
      if (err) return handleDatabaseError(err, res, 'comparing income plan and outcome (ETB)');
      if (handleEmptyResults(results, res, { total_income_plan_ETB: 0, total_income_outcome_ETB: 0 })) return;
      const { total_income_plan_ETB, total_income_outcome_ETB } = results[0];
      const difference = total_income_plan_ETB - total_income_outcome_ETB;
      res.json({ total_income_plan_ETB, total_income_outcome_ETB, difference });
    });
  } catch (error) {
    console.error('Unexpected error in compareIncomePlanOutcomeETB:', error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Compare Total Income Plan USD with Total Income Outcome USD using table, pie chart and bar chart
const compareIncomePlanOutcomeUSD = async (req, res) => {
  try {
    const joinClause = getJoinClause(req);
    const extraFilters = getFilterConditions(req);
    const query = `
      SELECT 
        COALESCE(SUM(sod.CIplan), 0) as total_income_plan_USD,
        COALESCE(SUM(sod.CIoutcome), 0) as total_income_outcome_USD
      ${joinClause}
      AND sod.plan_type = 'income' AND sod.income_exchange = 'USD' ${extraFilters}
    `;
    con.query(query, (err, results) => {
      if (err) return handleDatabaseError(err, res, 'comparing income plan and outcome (USD)');
      if (handleEmptyResults(results, res, { total_income_plan_USD: 0, total_income_outcome_USD: 0 })) return;
      const { total_income_plan_USD, total_income_outcome_USD } = results[0];
      const difference = total_income_plan_USD - total_income_outcome_USD;
      res.json({ total_income_plan_USD, total_income_outcome_USD, difference });
    });
  } catch (error) {
    console.error('Unexpected error in compareIncomePlanOutcomeUSD:', error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Compare Total Income (Plan vs Outcome) combining both ETB and USD (converted to ETB)
const compareIncomePlanOutcomeTotal = async (req, res) => {
  try {
    const USD_TO_ETB_RATE = 120; // Exchange rate: 1 USD = 120 ETB
    const joinClause = getJoinClause(req);
    const extraFilters = getFilterConditions(req);

    console.log('Starting income comparison with filters:', { joinClause, extraFilters });

    const query = `
      SELECT 
        COALESCE(SUM(CASE 
          WHEN sod.income_exchange = 'ETB' THEN CIplan
          WHEN sod.income_exchange = 'USD' THEN CIplan * ${USD_TO_ETB_RATE}
          ELSE 0 
        END), 0) as total_income_plan_combined_ETB,
        COALESCE(SUM(CASE 
          WHEN sod.income_exchange = 'ETB' THEN CIoutcome
          WHEN sod.income_exchange = 'USD' THEN CIoutcome * ${USD_TO_ETB_RATE}
          ELSE 0 
        END), 0) as total_income_outcome_combined_ETB,
        COALESCE(SUM(CASE WHEN sod.income_exchange = 'ETB' THEN CIplan ELSE 0 END), 0) as total_income_plan_ETB,
        COALESCE(SUM(CASE WHEN sod.income_exchange = 'ETB' THEN CIoutcome ELSE 0 END), 0) as total_income_outcome_ETB,
        COALESCE(SUM(CASE WHEN sod.income_exchange = 'USD' THEN CIplan ELSE 0 END), 0) as total_income_plan_USD,
        COALESCE(SUM(CASE WHEN sod.income_exchange = 'USD' THEN CIoutcome ELSE 0 END), 0) as total_income_outcome_USD
      ${joinClause}
      AND sod.plan_type = 'income' ${extraFilters}
    `;

    console.log('Executing query:', query);

    con.query(query, (err, results) => {
      if (err) {
        console.error('Database Error:', {
          message: err.message,
          code: err.code,
          state: err.sqlState,
          stack: err.stack
        });
        return handleDatabaseError(err, res, 'comparing total income plan and outcome');
      }

      console.log('Query results:', JSON.stringify(results, null, 2));

      if (handleEmptyResults(results, res, {
        total_income_plan_combined_ETB: 0,
        total_income_outcome_combined_ETB: 0,
        breakdown: {
          ETB: { plan: 0, outcome: 0 },
          USD: { plan: 0, outcome: 0 }
        }
      })) {
        console.log('No results found for the query');
        return;
      }

      const {
        total_income_plan_combined_ETB,
        total_income_outcome_combined_ETB,
        total_income_plan_ETB,
        total_income_outcome_ETB,
        total_income_plan_USD,
        total_income_outcome_USD
      } = results[0];

      console.log('Extracted values:', {
        total_income_plan_combined_ETB,
        total_income_outcome_combined_ETB,
        total_income_plan_ETB,
        total_income_outcome_ETB,
        total_income_plan_USD,
        total_income_outcome_USD
      });

      const difference_combined_ETB = total_income_plan_combined_ETB - total_income_outcome_combined_ETB;

      const response = {
        combined_ETB: {
          plan: total_income_plan_combined_ETB,
          outcome: total_income_outcome_combined_ETB,
          difference: difference_combined_ETB
        },
        breakdown: {
          ETB: {
            plan: total_income_plan_ETB,
            outcome: total_income_outcome_ETB,
            difference: total_income_plan_ETB - total_income_outcome_ETB
          },
          USD: {
            plan: total_income_plan_USD,
            outcome: total_income_outcome_USD,
            difference: total_income_plan_USD - total_income_outcome_USD,
            plan_in_ETB: total_income_plan_USD * USD_TO_ETB_RATE,
            outcome_in_ETB: total_income_outcome_USD * USD_TO_ETB_RATE
          }
        },
        exchange_rate: {
          USD_TO_ETB: USD_TO_ETB_RATE
        }
      };

      console.log('Final response:', JSON.stringify(response, null, 2));
      res.json(response);
    });
  } catch (error) {
    console.error('Unexpected error in compareIncomePlanOutcomeTotal:', {
      message: error.message,
      stack: error.stack,
      details: error
    });
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


const displayTotalHR = async (req, res) => {
  try {
    const joinClause = getJoinClause(req);
    const extraFilters = getFilterConditions(req);
    const query = `
      SELECT COALESCE(SUM(sod.hr_count), 0) as total_hr 
      ${joinClause} ${extraFilters}`;

    con.query(query, (err, results) => {
      if (err) return handleDatabaseError(err, res, 'fetching total HR');
      if (handleEmptyResults(results, res, { total_hr: 0 })) return;
      res.json(results[0].total_hr);
    });
  } catch (error) {
    console.error('Unexpected error in displayTotalHR:', error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};







const HRPlanOutcomeDifferenceFulltime = async (req, res) => {
  try {
    // Retrieve joinClause and extraFilters from the request.
    // Using getJoinClause which returns the BASE_JOIN already.
    let joinClause = getJoinClause(req);
    const extraFilters = getFilterConditions(req) || "";

    // If joinClause is missing a FROM clause, fallback to the BASE_JOIN.
    if (!joinClause || !/FROM\s+/i.test(joinClause)) {
      joinClause = BASE_JOIN;
      console.warn("joinClause not provided or missing FROM clause; using default BASE_JOIN");
    }

    // Build the SQL query string. This groups rows by specific_objective_detailname.
    // No extra join is appended here.
    const query = `
      SELECT 
        sod.specific_objective_detailname,
        COALESCE(SUM(CASE WHEN sod.plan_type = 'hr' THEN sod.CIplan END), 0) AS plan,
        COALESCE(SUM(CASE WHEN sod.plan_type = 'hr' THEN sod.CIoutcome END), 0) AS outcome,
        COALESCE(SUM(CASE WHEN sod.plan_type = 'hr' THEN sod.CIplan END), 0) - COALESCE(SUM(CASE WHEN sod.plan_type = 'hr' THEN sod.CIoutcome END), 0) AS difference
      ${joinClause}
      AND sod.plan_type = 'hr' AND 
        sod.employment_type = 'full_time' ${extraFilters}
      GROUP BY sod.specific_objective_detailname
    `;

    console.log("Constructed Query:", query);

    con.query(query, (err, results) => {
      if (err) {
        console.error("Database error occurred:", err);
        return handleDatabaseError(err, res, "comparing cost plan and outcome total_regular");
      }

      // Check if the results are empty. If so, return default structured response.
      if (handleEmptyResults(results, res, { data: [], totals: { plan: 0, outcome: 0, difference: 0 } })) {
        return;
      }

      // Log the raw SQL results for debugging purposes.
      console.log("SQL Query Results:", results);

      // Compute overall totals by iterating over the grouped results.
      let totalPlan = 0;
      let totalOutcome = 0;
      results.forEach(row => {
        totalPlan += Number(row.plan);
        totalOutcome += Number(row.outcome);
      });
      const totalDifference = totalPlan - totalOutcome;

      // Build the final response object.
      const responseData = {
        data: results, // array of { costName, plan, outcome, difference }
        totals: {
          plan: totalPlan,
          outcome: totalOutcome,
          difference: totalDifference
        }
      };

      // Log computed totals.
      console.log("Computed Totals - Total Plan:", totalPlan, "Total Outcome:", totalOutcome, "Total Difference:", totalDifference);

      // Send the computed data to the frontend.
      res.json(responseData);
    });

  } catch (error) {
    console.error("Unexpected error in hrPlanOutcomeDifferenceFulltime:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


const DefaultPlanOutcomeDifferenceFulltime = async (req, res) => {
  try {
    // Retrieve joinClause and extraFilters from the request.
    let joinClause = getJoinClause(req);
    const extraFilters = getFilterConditions(req) || "";

    // Fallback to BASE_JOIN if joinClause is missing the FROM clause.
    if (!joinClause || !/FROM\s+/i.test(joinClause)) {
      joinClause = BASE_JOIN;
      console.warn("joinClause not provided or missing FROM clause; using default BASE_JOIN");
    }

    // Append a LEFT JOIN to fetch department name from the departments table
    const joinDepartment = " LEFT JOIN departments d ON sod.department_id = d.department_id";

    // Build the SQL query string.
    // Fetching department name (d.name), and calculating difference (plan - outcome) along with execution_percentage.
    const query = `
      SELECT 
        sod.specific_objective_detailname,
        sod.department_id,
        d.name AS department,
        sod.details,
        COALESCE(SUM(CASE WHEN sod.plan_type = 'default_plan' THEN sod.plan END), 0) AS plan,
        COALESCE(SUM(CASE WHEN sod.plan_type = 'default_plan' THEN sod.outcome END), 0) AS outcome,
        COALESCE(SUM(CASE WHEN sod.plan_type = 'default_plan' THEN sod.plan END), 0) - COALESCE(SUM(CASE WHEN sod.plan_type = 'default_plan' THEN sod.outcome END), 0) AS difference,
        CASE 
          WHEN COALESCE(SUM(CASE WHEN sod.plan_type = 'default_plan' THEN sod.plan END), 0) = 0 THEN 0
          ELSE (COALESCE(SUM(CASE WHEN sod.plan_type = 'default_plan' THEN sod.outcome END), 0) / COALESCE(SUM(CASE WHEN sod.plan_type = 'default_plan' THEN sod.plan END), 0)) * 100
        END AS execution_percentage
      ${joinClause}
      ${joinDepartment}
      AND sod.plan_type = 'default_plan' ${extraFilters}
      GROUP BY sod.specific_objective_detailname, sod.department_id, d.name, sod.details
    `;

    console.log("Constructed Query:", query);

    con.query(query, (err, results) => {
      if (err) {
        console.error("Database error occurred:", err);
        return handleDatabaseError(err, res, " plan and outcome ");
      }

      // Check for empty results; if so, return a default response.
      if (handleEmptyResults(results, res, { data: [], totals: { plan: 0, outcome: 0, difference: 0, execution_percentage: 0 } })) {
        return;
      }

      console.log("SQL Query Results:", results);

      // Compute overall totals.
      let totalPlan = 0;
      let totalOutcome = 0;
      results.forEach(row => {
        totalPlan += Number(row.plan);
        totalOutcome += Number(row.outcome);
      });
      const overallDifference = totalPlan - totalOutcome;
      const overallExecutionPercentage = totalPlan === 0 ? 0 : (totalOutcome / totalPlan) * 100;

      console.log("Computed Totals - Total Plan:", totalPlan, "Total Outcome:", totalOutcome, "Overall Difference:", overallDifference, "Overall Execution Percentage:", overallExecutionPercentage);

      // Build the final response object.
      const responseData = {
        data: results, // Each row includes specific_objective_detailname, department_id, department name, details, plan, outcome, difference, and execution_percentage.
        totals: {
          plan: totalPlan,
          outcome: totalOutcome,
          difference: overallDifference,
          execution_percentage: overallExecutionPercentage
        }
      };

      res.json(responseData);
    });

  } catch (error) {
    console.error("Unexpected error in DefaultPlanOutcomeDifferenceFulltime:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// User Performance Ranking - Top 5 employees by execution percentage
const userPerformanceRanking = async (req, res) => {
  try {
    const { year, quarter, month } = req.query;
    const extraFilters = getFilterConditions(req);

    let periodFilter = "";
    if (month) periodFilter += ` AND sod.month = ${con.escape(month)}`;
    if (quarter) periodFilter += ` AND g.quarter = ${con.escape(quarter)}`;
    if (year) periodFilter += ` AND sod.year = ${con.escape(year)}`;

    const query = `
      SELECT 
        e.employee_id,
        e.name as employee_name,
        d.name as department,
        COUNT(sod.specific_objective_detail_id) as total_objectives,
        AVG(COALESCE(sod.CIexecution_percentage, sod.execution_percentage, 0)) as execution_percentage,
        SUM(COALESCE(sod.CIplan, 0)) as total_plan,
        SUM(COALESCE(sod.CIoutcome, 0)) as total_outcome
      FROM specific_objective_details sod
      JOIN plans p ON sod.specific_objective_detail_id = p.specific_objective_detail_id
      JOIN goals g ON p.goal_id = g.goal_id
      JOIN approvalworkflow aw ON p.plan_id = aw.plan_id
      LEFT JOIN employees e ON sod.created_by = e.employee_id
      LEFT JOIN departments d ON sod.department_id = d.department_id
      WHERE aw.status = 'completed'
      AND aw.comment NOT LIKE 'REFERRED by %'
      AND aw.comment NOT LIKE 'Referred from %'
      ${periodFilter}
      ${extraFilters}
      GROUP BY e.employee_id, e.name, d.name
      HAVING COUNT(sod.specific_objective_detail_id) > 0
      ORDER BY execution_percentage DESC
      LIMIT 10
    `;

    con.query(query, (err, results) => {
      if (err) return handleDatabaseError(err, res, 'fetching user performance rankings');
      res.json(results);
    });
  } catch (error) {
    console.error('Unexpected error in userPerformanceRanking:', error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Unit Performance Ranking - Top 5 Org Units by execution percentage
const unitPerformanceRanking = async (req, res) => {
  try {
    const { year, quarter, month } = req.query;
    const extraFilters = getFilterConditions(req);

    let periodFilter = "";
    if (month) periodFilter += ` AND sod.month = ${con.escape(month)}`;
    if (quarter) periodFilter += ` AND g.quarter = ${con.escape(quarter)}`;
    if (year) periodFilter += ` AND sod.year = ${con.escape(year)}`;

    const query = `
      SELECT 
        os.id as unit_id,
        os.name as unit_name,
        os.name_amharic as unit_name_am,
        COUNT(sod.specific_objective_detail_id) as total_objectives,
        AVG(COALESCE(sod.CIexecution_percentage, sod.execution_percentage, 0)) as execution_percentage,
        SUM(COALESCE(sod.CIplan, 0)) as total_plan,
        SUM(COALESCE(sod.CIoutcome, 0)) as total_outcome
      FROM specific_objective_details sod
      JOIN plans p ON sod.specific_objective_detail_id = p.specific_objective_detail_id
      JOIN goals g ON p.goal_id = g.goal_id
      JOIN approvalworkflow aw ON p.plan_id = aw.plan_id
      JOIN organization_structure os ON sod.department_id = os.id
      WHERE aw.status = 'completed'
      AND aw.comment NOT LIKE 'REFERRED by %'
      AND aw.comment NOT LIKE 'Referred from %'
      ${periodFilter}
      ${extraFilters}
      GROUP BY os.id, os.name, os.name_amharic
      HAVING COUNT(sod.specific_objective_detail_id) > 0
      ORDER BY execution_percentage DESC
      LIMIT 10
    `;

    con.query(query, (err, results) => {
      if (err) return handleDatabaseError(err, res, 'fetching unit performance rankings');
      res.json(results);
    });
  } catch (error) {
    console.error('Unexpected error in unitPerformanceRanking:', error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Get income data grouped by income name with plan and outcome
const compareIncomeByName = async (req, res) => {
  try {
    const joinClause = getJoinClause(req);
    const extraFilters = getFilterConditions(req);

    const query = `
      SELECT 
        sod.incomeName,
        sod.income_exchange,
        COALESCE(SUM(CASE WHEN sod.plan_type = 'income' THEN sod.CIplan END), 0) as plan,
        COALESCE(SUM(CASE WHEN sod.plan_type = 'income' THEN sod.CIoutcome END), 0) as outcome,
        COALESCE(SUM(CASE WHEN sod.plan_type = 'income' THEN sod.CIplan END), 0) - COALESCE(SUM(CASE WHEN sod.plan_type = 'income' THEN sod.CIoutcome END), 0) as difference
      ${joinClause}
      AND sod.plan_type = 'income' ${extraFilters}
      GROUP BY sod.incomeName, sod.income_exchange
      ORDER BY sod.incomeName ASC
    `;

    console.log("Income by Name Query:", query);

    con.query(query, (err, results) => {
      if (err) return handleDatabaseError(err, res, 'comparing income by name');

      if (handleEmptyResults(results, res, { data: [], totals: { plan: 0, outcome: 0, difference: 0 } })) {
        return;
      }

      console.log("Income by Name Results:", results);

      // Compute overall totals
      let totalPlan = 0;
      let totalOutcome = 0;
      results.forEach(row => {
        totalPlan += Number(row.plan);
        totalOutcome += Number(row.outcome);
      });
      const totalDifference = totalPlan - totalOutcome;

      const responseData = {
        data: results,
        totals: {
          plan: totalPlan,
          outcome: totalOutcome,
          difference: totalDifference
        }
      };

      console.log("Income by Name Response:", responseData);
      res.json(responseData);
    });
  } catch (error) {
    console.error('Unexpected error in compareIncomeByName:', error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Get completed plan income details
const getCompletedPlanIncomeDetails = async (req, res) => {
  try {
    const extraFilters = getFilterConditions(req);

    const query = `
      SELECT 
        p.plan_id,
        COALESCE(so.specific_objective_name, 'N/A') as specific_objective_name,
        COALESCE(sod.incomeName, 'Unknown Income') as incomeName,
        COALESCE(sod.income_exchange, 'ETB') as income_exchange,
        COALESCE(sod.CIplan, 0) as plan_amount,
        COALESCE(sod.CIoutcome, 0) as outcome_amount,
        COALESCE(sod.CIplan, 0) - COALESCE(sod.CIoutcome, 0) as difference,
        CASE 
          WHEN COALESCE(sod.CIplan, 0) = 0 THEN 0
          ELSE (COALESCE(sod.CIoutcome, 0) / COALESCE(sod.CIplan, 0)) * 100
        END as execution_percentage,
        COALESCE(g.year, 0) as year,
        COALESCE(g.quarter, 'N/A') as quarter,
        COALESCE(e.name, COALESCE(sod.created_by, 'Unknown')) as created_by_name,
        COALESCE(d.name, 'N/A') as department_name,
        p.created_at,
        aw.approval_date
      FROM specific_objective_details sod
      JOIN specific_objectives so ON sod.specific_objective_id = so.specific_objective_id
      JOIN objectives o ON so.objective_id = o.objective_id
      JOIN goals g ON o.goal_id = g.goal_id
      JOIN plans p ON p.specific_objective_detail_id = sod.specific_objective_detail_id
      JOIN approvalworkflow aw ON p.plan_id = aw.plan_id
      LEFT JOIN employees e ON sod.created_by = e.employee_id
      LEFT JOIN departments d ON sod.department_id = d.department_id
      WHERE aw.status = 'completed'
      AND aw.comment NOT LIKE 'REFERRED by %'
      AND aw.comment NOT LIKE 'Referred from %'
      AND sod.plan_type = 'income' ${extraFilters}
      ORDER BY p.created_at DESC
      LIMIT 100
    `;

    console.log("Completed Plan Income Details Query:", query);

    con.query(query, (err, results) => {
      if (err) return handleDatabaseError(err, res, 'fetching completed plan income details');

      if (handleEmptyResults(results, res, { data: [], totals: { plan: 0, outcome: 0, difference: 0 } })) {
        return;
      }

      console.log("Completed Plan Income Details Results:", results);

      // Compute overall totals
      let totalPlan = 0;
      let totalOutcome = 0;
      results.forEach(row => {
        totalPlan += Number(row.plan_amount || 0);
        totalOutcome += Number(row.outcome_amount || 0);
      });
      const totalDifference = totalPlan - totalOutcome;

      const responseData = {
        data: results,
        totals: {
          plan: totalPlan,
          outcome: totalOutcome,
          difference: totalDifference,
          count: results.length
        }
      };

      console.log("Completed Plan Income Details Response:", responseData);
      res.json(responseData);
    });
  } catch (error) {
    console.error('Unexpected error in getCompletedPlanIncomeDetails:', error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// --- Detailed Reporting Functions ---

// 1. Cost Reporting (Granular)
const getCostReporting = async (req, res) => {
  try {
    const extraFilters = getFilterConditions(req);
    const query = `
      SELECT 
        sod.cost_type,
        COALESCE(SUM(sod.CIplan), 0) AS plan,
        COALESCE(SUM(sod.CIoutcome), 0) AS execution,
        CASE 
          WHEN COALESCE(SUM(sod.CIplan), 0) = 0 THEN 0
          ELSE (COALESCE(SUM(sod.CIoutcome), 0) / COALESCE(SUM(sod.CIplan), 0)) * 100
        END AS execution_percentage
      ${BASE_JOIN}
      AND sod.plan_type = 'cost' ${extraFilters}
      GROUP BY sod.cost_type
    `;
    con.query(query, (err, results) => {
      if (err) return handleDatabaseError(err, res, 'fetching cost reporting');
      res.json(results);
    });
  } catch (error) {
    handleDatabaseError(error, res, 'fetching cost reporting');
  }
};

// 2. Income Reporting (Granular)
const getIncomeReporting = async (req, res) => {
  try {
    const USD_TO_ETB_RATE = 120;
    const extraFilters = getFilterConditions(req);
    const query = `
      SELECT 
        sod.income_plan_type,
        sod.income_exchange,
        COALESCE(SUM(sod.CIplan), 0) AS plan,
        COALESCE(SUM(sod.CIoutcome), 0) AS execution,
        CASE 
          WHEN sod.income_exchange = 'USD' THEN COALESCE(SUM(sod.CIplan * ${USD_TO_ETB_RATE}), 0)
          ELSE COALESCE(SUM(sod.CIplan), 0)
        END AS plan_in_etb,
        CASE 
          WHEN sod.income_exchange = 'USD' THEN COALESCE(SUM(sod.CIoutcome * ${USD_TO_ETB_RATE}), 0)
          ELSE COALESCE(SUM(sod.CIoutcome), 0)
        END AS execution_in_etb,
        CASE 
          WHEN COALESCE(SUM(sod.CIplan), 0) = 0 THEN 0
          ELSE (COALESCE(SUM(sod.CIoutcome), 0) / COALESCE(SUM(sod.CIplan), 0)) * 100
        END AS execution_percentage
      ${BASE_JOIN}
      AND sod.plan_type = 'income' ${extraFilters}
      GROUP BY sod.income_plan_type, sod.income_exchange
    `;
    con.query(query, (err, results) => {
      if (err) return handleDatabaseError(err, res, 'fetching income reporting');
      res.json(results);
    });
  } catch (error) {
    handleDatabaseError(error, res, 'fetching income reporting');
  }
};

// 3. Comparison of Cost and Income
const getCostVsIncomeReporting = async (req, res) => {
  try {
    const USD_TO_ETB_RATE = 120;
    const extraFilters = getFilterConditions(req);
    const query = `
      SELECT 
        'Income' as category,
        sod.income_plan_type as type,
        COALESCE(SUM(CASE WHEN sod.income_exchange = 'USD' THEN sod.CIplan * ${USD_TO_ETB_RATE} ELSE sod.CIplan END), 0) as plan_etb,
        COALESCE(SUM(CASE WHEN sod.income_exchange = 'USD' THEN sod.CIoutcome * ${USD_TO_ETB_RATE} ELSE sod.CIoutcome END), 0) as execution_etb
      ${BASE_JOIN}
      AND sod.plan_type = 'income' ${extraFilters}
      GROUP BY sod.income_plan_type
      UNION ALL
      SELECT 
        'Cost' as category,
        sod.cost_type as type,
        COALESCE(SUM(sod.CIplan), 0) as plan_etb,
        COALESCE(SUM(sod.CIoutcome), 0) as execution_etb
      ${BASE_JOIN}
      AND sod.plan_type = 'cost' ${extraFilters}
      GROUP BY sod.cost_type
    `;
    con.query(query, (err, results) => {
      if (err) return handleDatabaseError(err, res, 'fetching comparison reporting');
      res.json(results);
    });
  } catch (error) {
    handleDatabaseError(error, res, 'fetching comparison reporting');
  }
};

// 4. HR Reporting
const getHRReporting = async (req, res) => {
  try {
    const extraFilters = getFilterConditions(req);
    const query = `
      SELECT 
        sod.employee_of,
        COALESCE(SUM(sod.CIplan), 0) AS plan,
        COALESCE(SUM(sod.CIoutcome), 0) AS execution,
        CASE 
          WHEN COALESCE(SUM(sod.CIplan), 0) = 0 THEN 0
          ELSE (COALESCE(SUM(sod.CIoutcome), 0) / COALESCE(SUM(sod.CIplan), 0)) * 100
        END AS execution_percentage
      ${BASE_JOIN}
      AND sod.plan_type = 'hr' ${extraFilters}
      GROUP BY sod.employee_of
    `;
    con.query(query, (err, results) => {
      if (err) return handleDatabaseError(err, res, 'fetching hr reporting');
      res.json(results);
    });
  } catch (error) {
    handleDatabaseError(error, res, 'fetching hr reporting');
  }
};

// 5. Project Reporting
const getProjectReporting = async (req, res) => {
  try {
    const extraFilters = getFilterConditions(req);
    const query = `
      SELECT 
        sod.project_type,
        COALESCE(SUM(sod.CIplan), 0) AS plan,
        COALESCE(SUM(sod.CIoutcome), 0) AS execution,
        CASE 
          WHEN COALESCE(SUM(sod.CIplan), 0) = 0 THEN 0
          ELSE (COALESCE(SUM(sod.CIoutcome), 0) / COALESCE(SUM(sod.CIplan), 0)) * 100
        END AS execution_percentage
      ${BASE_JOIN}
      AND sod.plan_type = 'project' ${extraFilters}
      GROUP BY sod.project_type
    `;
    con.query(query, (err, results) => {
      if (err) return handleDatabaseError(err, res, 'fetching project reporting');
      res.json(results);
    });
  } catch (error) {
    handleDatabaseError(error, res, 'fetching project reporting');
  }
};

// 6. General Reporting
const getDetailedFullReporting = async (req, res) => {
  try {
    const extraFilters = getFilterConditions(req);
    // Joining departments and employees to provide more context for the tabular view
    const query = `
      SELECT 
        g.year,
        g.quarter,
        d.name as department_name,
        g.name as goal_name,
        o.name as objective_name,
        so.specific_objective_name,
        sod.specific_objective_detailname,
        sod.description as detail_description,
        sod.plan_type,
        sod.cost_type,
        sod.income_plan_type,
        sod.project_type,
        sod.employment_type,
        sod.employee_of,
        sod.income_exchange,
        sod.CIplan,
        sod.CIoutcome,
        sod.baseline,
        sod.measurement,
        sod.plan as target_value,
        aw.status as approval_status,
        aw.comment as approval_comment
      FROM specific_objective_details sod
      JOIN specific_objectives so ON sod.specific_objective_id = so.specific_objective_id
      JOIN objectives o ON so.objective_id = o.objective_id
      JOIN goals g ON o.goal_id = g.goal_id
      JOIN plans p ON p.specific_objective_detail_id = sod.specific_objective_detail_id
      JOIN approvalworkflow aw ON p.plan_id = aw.plan_id
      LEFT JOIN departments d ON sod.department_id = d.department_id
      WHERE aw.status = 'completed'
      AND aw.comment NOT LIKE 'REFERRED by %'
      AND aw.comment NOT LIKE 'Referred from %'
      ${extraFilters}
      ORDER BY g.year DESC, g.quarter DESC, d.name ASC
    `;
    con.query(query, (err, results) => {
      if (err) return handleDatabaseError(err, res, 'fetching detailed reporting');
      res.json(results);
    });
  } catch (error) {
    handleDatabaseError(error, res, 'fetching detailed reporting');
  }
};

const getGeneralReporting = async (req, res) => {
  try {
    const extraFilters = getFilterConditions(req);
    const query = `
      SELECT 
        COALESCE(SUM(sod.CIplan), 0) AS total_plan,
        COALESCE(SUM(sod.CIoutcome), 0) AS total_execution,
        CASE 
          WHEN COALESCE(SUM(sod.CIplan), 0) = 0 THEN 0
          ELSE (COALESCE(SUM(sod.CIoutcome), 0) / COALESCE(SUM(sod.CIplan), 0)) * 100
        END AS overall_execution_percentage
      ${BASE_JOIN}
      AND 1=1 ${extraFilters}
    `;
    con.query(query, (err, results) => {
      if (err) return handleDatabaseError(err, res, 'fetching general reporting');
      res.json(results[0]);
    });
  } catch (error) {
    handleDatabaseError(error, res, 'fetching general reporting');
  }
};

module.exports = {
  getCostReporting,
  getIncomeReporting,
  getCostVsIncomeReporting,
  getHRReporting,
  getProjectReporting,
  getGeneralReporting,
  getDetailedFullReporting,

  //Human Resource analitics

  displayTotalCost,

  displayTotalCostPlan,
  compareCostPlanOutcome,
  displayTotalCostExcutionPercentage,
  displayTotalIncomeOutcomeETB,
  displayTotalIncomeOutcomeUSD,
  displayTotalIncomeplanETB,
  displayTotalIncomePlanUSD,
  compareIncomePlanOutcomeETB,
  compareIncomePlanOutcomeUSD,
  compareIncomePlanOutcomeTotal,
  compareIncomeByName,
  getCompletedPlanIncomeDetails,
  costPlanOutcomeDifferenceRegularBudget,
  costPlanOutcomeDifferenceCapitalBudget,

  HRPlanOutcomeDifferenceFulltime,
  DefaultPlanOutcomeDifferenceFulltime,
  userPerformanceRanking,
  unitPerformanceRanking
};