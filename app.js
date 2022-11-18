//requiring modules

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const _ = require("lodash");




//initialising express
const app = express();



//initialising body parser
app.use(bodyParser.urlencoded({
  extended: true
}));



//setting view folder for template
app.set('view engine', 'ejs');



//applying css
app.use(express.static("public"));



//connecting to mongoDB
mongoose.connect("mongodb+srv://admin-rocketcodes:mzmschool@cluster1.v0l1hp9.mongodb.net/todolistDB");


//creating itemschema for default list
const itemsSchema = mongoose.Schema({

  name: String

});

//creating itemschema for custom list

const selfListSchema = mongoose.Schema({
  name: String,
  items: [itemsSchema]
});



//creating model for default list
const Item = mongoose.model("Item", itemsSchema);




//creating model for custom list
const List = mongoose.model("List", selfListSchema);




//creating default items
const item1 = new Item({
  name: "Buy Food"
});

const item2 = new Item({
  name: "Cook Food"
});

const item3 = new Item({
  name: "Eat Food"
});

const defaultItems = [item1, item2, item3];





//request for homepage
app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {

    if (foundItems.length == 0) {

      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Default todo works inserted Successfully");
        }
      });

      res.redirect("/");
    } else {

      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
      console.log("All items are being displayed");

    }
  });


});





//response from homepage
app.post("/", function(req, res) {



  const itemName = req.body.newItem;
  const listName = req.body.list;

  const itemd = new Item({
    name: itemName
  });

  if(listName=="Today"){


    itemd.save();
    res.redirect("/");
  }

  else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(itemd);

      foundList.save();
      res.redirect("/"+listName);

    });
  }


});





//for deleting the items homepage
app.post("/delete", function(req, res) {
  const deleteItem = req.body.checkbox;
  const listName = req.body.listName;

if(listName=="Today"){
  Item.findByIdAndRemove(deleteItem, function(err) {
    if (err) {
      console.log(err);
    } else {
      console.log("Item has been removed");
    }
  });
  res.redirect("/");
}

else{
  List.findOneAndUpdate({name:listName},{$pull:{items:{_id:deleteItem}}},function(err , foundList){
    if(!err){
      res.redirect("/"+listName);
    }
  });
}


});





//req for custom list making
app.get("/:someURL", function(req, res) {
  const customList = _.capitalize(req.params.someURL);

  List.findOne({name: customList}, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customList,
          items: defaultItems
        });

        list.save();

        res.redirect("/" + customList);

      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    }
  });

});



//response for custom list making



//about page
app.get("/about", function(req, res) {
  res.render("about");
});





//initailising server

app.listen(process.env.PORT||3000,function(){
  console.log("Server started......");
});
