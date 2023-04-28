const sql = require('mssql');

// Replace these with your actual connection details
const config = {
    user: '<your-db-user>',
    password: '<your-db-password>',
    server: '<your-db-server>.database.windows.net',
    database: '<your-db-name>',

    options: {
        encrypt: true,
        trustServerCertificate: false,
        enableArithAbort: true
    }
};

async function createTableIfNotExists() {
    const createTableQuery = `
        IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = N'users')
        BEGIN
            CREATE TABLE users (
                id INT PRIMARY KEY IDENTITY(1, 1),
                name NVARCHAR(255) NOT NULL,
                email NVARCHAR(255) NOT NULL UNIQUE
            );
        END
    `;

    try {
        await sql.connect(config);
        const request = new sql.Request();
        await request.query(createTableQuery);
        await sql.close();
    } catch (err) {
        console.error('Error occurred while creating the table:', err);
        await sql.close();
    }
}

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    const name = (req.query.name || (req.body && req.body.name));
    const responseMessage = name
        ? "Hello, " + name + ". This HTTP triggered function executed successfully."
        : "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.";

    if (name) {
        try {
            // Connect to the Azure SQL Database
            await sql.connect(config);

            // Replace this query with your desired SQL query to insert data
            const insertQuery = `INSERT INTO your_table (name) VALUES (@name)`;

            // Create a new SQL request
            const request = new sql.Request();

            // Add input parameters
            request.input('name', sql.NVarChar, name);

            // Execute the query
            await request.query(insertQuery);

            context.log('Data inserted successfully.');

            // Close the connection
            await sql.close();
        } catch (err) {
            context.log.error('Error occurred while inserting data: ', err);
            responseMessage = 'Error occurred while inserting data: ' + err.message;

            // Close the connection if an error occurred
            await sql.close();
        }
    }

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: responseMessage
    };
};
