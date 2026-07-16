const getSubmittedPlans = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    console.error("Error: No token provided in the request headers.");
    return res.status(403).json({
      success: false,
      message: "No token provided. Authorization token is required to access the plans.",
      error_code: "TOKEN_MISSING",
    });
  }

  try {
    const user_id = await verifyToken(token); // Get user_id from token
    console.log(`Decoded user_id from token: ${user_id}`);

    // Get employee_id from the users table using user_id
    const getEmployeeQuery = "SELECT employee_id FROM users WHERE user_id = ?";
    con.query(getEmployeeQuery, [user_id], async (err, results) => {
      if (err) {
        console.error("Database Error (fetching employee_id):", err.message);
        return res.status(500).json({
          success: false,
          message: "Error fetching employee_id from users table.",
          error_code: "DB_ERROR",
          error: err.message,
        });
      }

      if (results.length === 0) {
        console.error(`No employee found for user_id: ${user_id}`);
        return res.status(404).json({
          success: false,
          message: "Employee not found. Unable to fetch employee details based on the provided user_id.",
          error_code: "EMPLOYEE_NOT_FOUND",
        });
      }

      const supervisor_id = results[0].employee_id;
      console.log(`Supervisor ID fetched: ${supervisor_id}`);

      // Extended query to fetch additional attributes from sod and related tables.
      const query = `
        SELECT 
          p.plan_id,
          p.user_id,
          sod.specific_objective_detail_id,
          sod.specific_objective_detailname,
          sod.details,
          sod.baseline,
          sod.plan,
          sod.measurement,
          sod.execution_percentage,
          sod.created_at,
          sod.updated_at,
          sod.year,
          sod.month,
          sod.day,
          sod.deadline,
          sod.status,
          sod.priority,
          p.department_id,
          d.name AS department_name,
         
          sod.count,
          sod.outcome,
          sod.progress,
          sod.created_by,
          sod.specific_objective_id,
          sod.plan_type,
          sod.income_exchange,
          sod.cost_type,
          sod.employment_type,
          sod.incomeName,
          sod.costName,
        
          sod.CIbaseline,
          sod.CIplan,
          sod.CIoutcome,
          sod.editing_status,
          sod.reporting,
          p.goal_id,
          o.name AS objective_name,
          g.name AS goal_name,
          so.specific_objective_name
        FROM plans p
        JOIN ApprovalWorkflow aw ON p.plan_id = aw.plan_id
        JOIN departments d ON p.department_id = d.department_id
        JOIN objectives o ON p.objective_id = o.objective_id
        JOIN specific_objectives so ON p.specific_objective_id = so.specific_objective_id
        JOIN goals g ON p.goal_id = g.goal_id
        JOIN specific_objective_details sod ON p.specific_objective_detail_id = sod.specific_objective_detail_id
        WHERE p.supervisor_id = ? 
          AND aw.approver_id = ? 
          AND aw.status = 'Pending';
      `;

      con.query(query, [supervisor_id, supervisor_id], (err, results) => {
        if (err) {
          console.error("Database Error (fetching plans):", err.message);
          return res.status(500).json({
            success: false,
            message: "Error fetching plans from database.",
            error_code: "DB_ERROR",
            error: err.message,
          });
        }

        if (!results || results.length === 0) {
          console.warn(`No plans found awaiting approval for supervisor_id: ${supervisor_id}`);
          return res.status(404).json({
            success: false,
            message: "No plans found awaiting approval for this supervisor.",
            error_code: "NO_PLANS_FOUND",
          });
        }

        // Filter out any columns that have null values from each row.
        const filteredResults = results.map(row => {
          return Object.fromEntries(Object.entries(row).filter(([key, value]) => value !== null));
        });

        console.log(`Plans fetched successfully: ${JSON.stringify(filteredResults, null, 2)}`);
        res.json({ success: true, plans: filteredResults });
      });
    });
  } catch (error) {
    console.error("Unknown Error:", error.message);
    res.status(500).json({
      success: false,
      message: `Unknown error occurred while fetching submitted plans. Error: ${error.message}`,
      error_code: "UNKNOWN_ERROR",
    });
  }
};