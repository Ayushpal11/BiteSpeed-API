import express from "express";
import cors from "cors";
import { AppDataSource } from "./config/database";
import { ContactService } from "./services/ContactService";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize database connection
AppDataSource.initialize()
    .then(() => {
        console.log("Database connection established");
    })
    .catch((error) => {
        console.error("Error connecting to database:", error);
    });

const contactService = new ContactService();

app.post("/identify", async (req, res) => {
    try {
        const { email, phoneNumber } = req.body;
        const result = await contactService.identifyContact(email, phoneNumber);
        res.json(result);
    } catch (error) {
        console.error("Error in /identify endpoint:", error);
        res.status(400).json({ error: error.message });
    }
});

app.get("/identify", async (req, res) => {
    try {
        const { email, phoneNumber } = req.query;
        const result = await contactService.identifyContact(
            typeof email === 'string' ? email : undefined,
            typeof phoneNumber === 'string' ? phoneNumber : undefined
        );
        res.json(result);
    } catch (error) {
        console.error("Error in GET /identify endpoint:", error);
        res.status(400).json({ error: error.message });
    }
});

app.put("/identify", async (req, res) => {
    try {
        const { id, email, phoneNumber } = req.body;
        if (!id) {
            return res.status(400).json({ error: "id is required for PUT" });
        }
        const contact = await contactService.contactRepository.findOneBy({ id });
        if (!contact) {
            return res.status(404).json({ error: "Contact not found" });
        }
        if (email !== undefined) contact.email = email;
        if (phoneNumber !== undefined) contact.phoneNumber = phoneNumber;
        await contactService.contactRepository.save(contact);
        const result = await contactService.identifyContact(email, phoneNumber);
        res.json(result);
    } catch (error) {
        console.error("Error in PUT /identify endpoint:", error);
        res.status(400).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 