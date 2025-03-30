const mongoose = require("mongoose");

async function configureDB(app)
{
    try
    {
        const PORT = process.env.PORT;
        const CONNECTION_URL = process.env.CONNECTION_URL;
        const connection = await mongoose.connect(CONNECTION_URL);
        app.listen(PORT,()=>{
            console.log(`HTTP server is listening at ${PORT}...`);
        });

    }
    catch(error)
    {
        console.error("Unable to start HTTP server because: ");
        console.error(error.message);
    }
}

module.exports = {
    configureDB
};
