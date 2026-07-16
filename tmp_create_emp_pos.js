const mysql = require("mysql");
require("dotenv").config();

const con = mysql.createConnection({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

con.connect();
const sql = `
CREATE TABLE IF NOT EXISTS employee_positions (
  id int(11) NOT NULL AUTO_INCREMENT,
  employee_id int(11) NOT NULL,
  org_node_id int(11) NOT NULL,
  is_primary tinyint(1) DEFAULT 0,
  is_delegation tinyint(1) DEFAULT 0,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
  FOREIGN KEY (org_node_id) REFERENCES organization_nodes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;
con.query(sql, (e) => {
    if (e) throw e;
    console.log("Table employee_positions created.");
    con.end();
});
