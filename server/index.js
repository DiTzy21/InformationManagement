import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import morgan from "morgan";
import kpiRoutes from "./routes/kpi.js";
import productRoutes from "./routes/product.js";
import transactionRoutes from "./routes/transaction.js";
import KPI from "./models/KPI.js";
import Product from "./models/Product.js";
import Transaction from "./models/Transaction.js";
import { kpis , products, transactions} from "./data/data.js";


/*configuration*/
dotenv.config()
const app = express();
app.use(express.json())
app.use(helmet())
app.use(helmet.crossOriginResourcePolicy({policy: "cross-origin"}))
app.use(morgan("common"))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(cors())

console.log("hello");
/*routes setup */

app.use("/kpi", kpiRoutes);
app.use("/product", productRoutes);
app.use("/transaction", transactionRoutes);


/*Mongoose Setup */

const PORT = process.env.PORT || 9000;
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("MongoDB connected successfully");
    
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`));

    await mongoose.connection.db.dropDatabase();
    KPI.insertMany(kpis)
      .then(() => {
        console.log("Data inserted successfully");
      })
      .catch((error) => {
        console.error("Error inserting data:", error);
      });
    Transaction.insertMany(transactions)
      .then(() => {
          console.log("Transactions inserted successfully");
        })
        .catch((error) => {
          console.error("Error inserting data:", error);
        });
      Product.insertMany(products)
      .then(() => {
          console.log("Product inserted successfully");
          })
        .catch((error) => {
          console.error("Error inserting data:", error);
          });
 })
 .catch((error) => console.log(`${error}did not connect`));
