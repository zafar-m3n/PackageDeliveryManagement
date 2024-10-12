// Importing required modules
const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const cors = require("cors");
const Driver = require("./models/driver.js");
const Package = require("./models/package.js");

// Configure Express
const app = express();
app.use(cors());
app.engine("html", ejs.renderFile);
app.set("view engine", "html");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Start the server on port 8080
app.listen(8080, () => {
  console.log("Server running on http://localhost:8080");
});

// MongoDB connection settings
const url =
  "mongodb+srv://admin:adminPassword@cluster0.sbk4qxz.mongodb.net/package_delivery?retryWrites=true&w=majority";

// Connect to MongoDB using Mongoose
mongoose
  .connect(url)
  .then(() => {
    console.log("Connected successfully to MongoDB server.");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/34082115/Durgka/api/v1/drivers", async (req, res) => {
  const { driver_name, driver_department, driver_licence, driver_isActive } =
    req.body;

  try {
    const newDriver = new Driver({
      driver_name,
      driver_department,
      driver_licence,
      driver_isActive,
    });
    const savedDriver = await newDriver.save();
    // const insertResult = await driverCollection.insertOne(newDriver);

    // res.status(201).json({
    //   id: insertResult.insertedId,
    //   driver_id: newDriver.driver_id,
    // });
    res.status(201).json({
      message: "Driver added successfully",
      driver: {
        id: savedDriver._id,
        driver_id: savedDriver.driver_id,
        driver_name: savedDriver.driver_name,
        department: savedDriver.driver_department,
        driver_licence: savedDriver.driver_licence,
        driver_isActive: savedDriver.driver_isActive,
      },
    });
  } catch (error) {
    console.error("Error inserting driver:", error);
    res.status(500).json({ message: "Error adding driver", error });
  }
});

// 2. List all Drivers (GET)
app.get("/34082115/Durgka/api/v1/drivers", async (req, res) => {
  try {
    const drivers = await Driver.find({}).exec();

    res.json(drivers);
  } catch (error) {
    console.error("Error fetching drivers:", error);
    res.status(500).json({ message: "Error fetching drivers", error });
  }
});

// 3. Delete Driver by ID (DELETE)
app.delete("/34082115/Durgka/api/v1/drivers/:driver_id", async (req, res) => {
  const { driver_id } = req.params;

  try {
    const driver = await Driver.findOne({ driver_id });

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    const deletePackagesResult = await Package.deleteMany({
      _id: { $in: driver.assigned_packages },
    });

    const deleteDriverResult = await Driver.deleteOne({ driver_id });
    res.json({
      acknowledged: true,
      deletedCount:
        deleteDriverResult.deletedCount + deletePackagesResult.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting driver and packages:", error);
    res
      .status(500)
      .json({ message: "Error deleting driver and packages", error });
  }
});

// 4. Update driver license and department by ID (PATCH)
app.patch("/34082115/Durgka/api/v1/drivers", async (req, res) => {
  const { id, driver_licence, driver_department, driver_isActive } = req.body;

  try {
    const updateResult = await Driver.updateOne(
      { _id: id },
      { $set: { driver_licence, driver_department, driver_isActive } }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ status: "ID not found" });
    }

    res.json({ status: "Driver updated successfully" });
  } catch (error) {
    console.error("Error updating driver:", error);
    res.status(500).json({ status: "Error updating driver", error });
  }
});

// 5. Insert a new Package (POST)
app.post("/34082115/Durgka/api/v1/packages/add", async (req, res) => {
  const {
    package_title,
    package_weight,
    package_destination,
    description,
    isAllocated,
    driver_id,
  } = req.body;

  try {
    const newPackage = new Package({
      package_title,
      package_weight,
      package_destination,
      description,
      isAllocated,
      driver_id,
    });

    const insertResult = await newPackage.save();

    res.status(201).json({
      id: insertResult._id,
      package_id: newPackage.package_id,
    });
  } catch (error) {
    console.error("Error inserting package:", error);
    res.status(500).json({ message: "Error adding package", error });
  }
});

// 6. List all Packages (GET)
app.get("/34082115/Durgka/api/v1/packages", async (req, res) => {
  try {
    const packages = await Package.find({}).exec();

    res.json(packages);
  } catch (error) {
    console.error("Error fetching packages:", error);
    res.status(500).json({ message: "Error fetching packages", error });
  }
});

// 7. Delete Package by ID (DELETE)
app.delete("/34082115/Durgka/api/v1/packages/:package_id", async (req, res) => {
  const { package_id } = req.params;

  try {
    const deleteResult = await Package.deleteOne({ package_id });

    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({ message: "Package not found" });
    }

    await Driver.updateMany(
      { assigned_packages: package_id },
      { $pull: { assigned_packages: package_id } }
    );

    res.json({
      acknowledged: true,
      deletedCount: deleteResult.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting package:", error);
    res.status(500).json({ message: "Error deleting package", error });
  }
});

// 8. Update package destination by ID (PUT)
app.patch("/34082115/Durgka/api/v1/packages/update", async (req, res) => {
  const { package_id, package_destination } = req.body;

  try {
    const updateResult = await Package.updateOne(
      { package_id },
      { $set: { package_destination } }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ status: "Package ID not found" });
    }

    res.json({ status: "Package updated successfully" });
  } catch (error) {
    console.error("Error updating package:", error);
    res.status(500).json({ status: "Error updating package", error });
  }
});

app.get("/34082115/Durgka/invalid-data", (req, res) => {
  res.status(400).sendFile(__dirname + "/invalid-data.html");
});

app.get("/34082115/Durgka/*", (req, res) => {
  res.status(404).sendFile(__dirname + "/404.html");
});

// 9. Get packages assigned to a driver by driver_id
app.get(
  "/34082115/Durgka/api/v1/drivers/:driver_id/packages",
  async (req, res) => {
    const { driver_id } = req.params;

    try {
      const packages = await Package.find({ driver_id: driver_id });

      if (packages.length === 0) {
        return res
          .status(404)
          .json({ message: "No packages found for this driver." });
      }

      res.json(packages);
    } catch (error) {
      console.error("Error fetching packages for driver:", error);
      res.status(500).json({ message: "Error fetching packages", error });
    }
  }
);
// 10. Get driver details for a specific package
app.get(
  "/34082115/Durgka/api/v1/packages/:package_id/driver",
  async (req, res) => {
    const { package_id } = req.params;

    try {
      const packageData = await Package.findOne({ package_id }).populate(
        "driver_id"
      );

      if (!packageData) {
        return res.status(404).json({ message: "Package not found" });
      }

      res.json(packageData.driver_id);
    } catch (error) {
      console.error("Error fetching driver for package:", error);
      res.status(500).json({ message: "Error fetching driver", error });
    }
  }
);
