const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded());
app.use(cors());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { default: axios } = require("axios");
const uri =
  "mongodb+srv://hasibimasdfsdmph:hasibimasdfdsmph@programming-hero.rmw27nw.mongodb.net/?retryWrites=true&w=majority&appName=Programming-Hero";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const payments = client.db("ssl").collection("payment");

app.get("/", async (req, res) => {
  res.send("result");
});

//Step 1: Initiate payment ---
// Post Request : https://sandbox.sslcommerz.com/gwprocess/v4/api.php

app.post("/create-payment", async (req, res) => {
  const paymentInfo = req.body;

  console.log(paymentInfo);

  const trxId = new ObjectId().toString();

  const initiateData = {
    store_id: "progr662834fdb450e",
    store_passwd: "progr662834fdb450e@ssl",
    total_amount: paymentInfo.amount,
    currency: "BDT",
    tran_id: trxId,
    success_url: "http://localhost:3000/success-payment",
    fail_url: "http://localhost:3000/fail",
    cancel_url: "http://localhost:3000/cancle",
    ipn_url: "http://localhost:3000/cancle",
    cus_name: "Customer Name",
    cus_email: "cust@yahoo.com&",
    cus_add1: "Dhaka&",
    cus_add2: "Dhaka&",
    cus_city: "Dhaka&",
    cus_state: "Dhaka&",
    cus_postcode: 1000,
    cus_country: "Bangladesh",
    cus_phone: "01711111111",
    cus_fax: "01711111111",
    shipping_method: "NO",
    product_name: "Laptop",
    product_category: "Laptop",
    product_profile: "general",
    multi_card_name: "mastercard,visacard,amexcard",
    value_a: "ref001_A&",
    value_b: "ref002_B&",
    value_c: "ref003_C&",
    value_d: "ref004_D",
  };

  const response = await axios({
    method: "POST",
    url: "https://sandbox.sslcommerz.com/gwprocess/v4/api.php",
    data: initiateData,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  const saveData = {
    cus_name: "Dumy",
    paymentId: trxId,
    amount: paymentInfo.amount,
    status: "Pending",
  };

  const save = await payments.insertOne(saveData);

  if (save) {
    res.send({
      paymentUrl: response.data.GatewayPageURL,
    });
  }
});

app.post("/success-payment", async (req, res) => {
  const successData = req.body;
  if (successData.status !== "VALID") {
    throw new Error("Unauthorized payment , Invalid Payment");
  }

  //update the database

  const query = {
    paymentId: successData.tran_id,
  };

  const update = {
    $set: {
      status: "Success",
    },
  };

  const updateData = await payments.updateOne(query, update);
  console.log("successData", successData);
  console.log("updateData", updateData);

  res.redirect("http://localhost:5173/success");
});
app.post("/fail", async (req, res) => {
  res.redirect("http://localhost:5173/fail");
});
app.post("/cancle", async (req, res) => {
  res.redirect("http://localhost:5173/cancle");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
