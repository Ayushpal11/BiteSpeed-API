"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const database_1 = require("./config/database");
const ContactService_1 = require("./services/ContactService");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
database_1.AppDataSource.initialize()
    .then(() => {
    console.log("Database connection established");
})
    .catch((error) => {
    console.error("Error connecting to database:", error);
});
const contactService = new ContactService_1.ContactService();
app.post("/identify", async (req, res) => {
    try {
        const { email, phoneNumber } = req.body;
        const result = await contactService.identifyContact(email, phoneNumber);
        res.json(result);
    }
    catch (error) {
        console.error("Error in /identify endpoint:", error);
        res.status(400).json({ error: error.message });
    }
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
//# sourceMappingURL=index.js.map