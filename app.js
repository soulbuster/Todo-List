//-----------------------------------------Express JS-Node JS defaults----------------------------------

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));
//_______________________________________________________________________________________________________

//-------------------------------------------EJS defaults------------------------------------------------

app.set("view engine", "ejs");
app.use(express.static("public"));
//_______________________________________________________________________________________________________

// ------------------------------------------Database defaults-------------------------------------------

const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://admin-prakash:OuuE3YJe3LAkcUdn@cluster01.bgwlu.mongodb.net/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please check your data entry and check your data input"]
  }
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Bath"
});

const item2 = new Item({
  name: "Breakfast"
});

const item3 = new Item({
  name: "Morning Study"
});

const defaultArr = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);

//___________________________________________________________________________________________________________


app.get("/", function(req, res) { // node
  Item.find({}, function(err, items) { // MongoDB
    if (items.length == 0) { // JS
      Item.insertMany(defaultArr, function(err) { // JS
        if (err) { // JS
          console.log(err); // JS
        } else { // JS
          console.log("defaults embidded"); // JS
        } // JS
      }); // JS
      res.redirect("/"); // node
    } else {
      res.render("list", { // EJS
        day: "Today", // EJS
        items: items // EJS
      }); // EJS
    } // JS
  }); // MongoDB
}); // node


app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item({
    name: itemName
  });

  if (listName === "Today") {
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function(err, foundList) {
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/" + listName);
    })
  }
});


app.post("/delete", function(req, res) {
  const itemID = req.body.checkBox;
  const listName = req.body.listName;

  if (listName == "Today") {
    Item.deleteOne({
      _id: "" + itemID
    }, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Success");
      }
    });
    res.redirect("/");
  } else {
    // this a findOneAndUpdate method from mongoDB which allow us to find the item and then update interval
    // List.findOneAndUpdate({filter: collectionName},{update: pull an element from {array {with this id}}});
    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: itemID
        }
      }
    }, function(err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    })
  }
});


app.get("/:customListName", function(req, res) {
  const customListName = (req.params.customListName).toLowerCase();

  List.findOne({
    name: customListName
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        // here at this point we will create a new list
        const list = new List({
          name: customListName,
          items: defaultArr
        });
        res.redirect("/" + customListName);
        list.save();
      } else {
        // here we will use the older list
        res.render("list", { // EJS
          day: foundList.name, // EJS
          items: foundList.items // EJS
        });
      }
    }
  })
});


app.listen(3000, function() {
  console.log("Server Started");
});
