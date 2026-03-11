const Chef = require("../models/chefSchema");

// Chef list
exports.chefList = async (req, res) => {

    try {

        const chefs = await Chef.find().populate("restaurant");

        res.render("chefs/chefList", {
            chefs,
            user: req.user
        });

    } catch (error) {

        console.log(error);
        res.redirect("/");

    }

};



// Chef form
exports.chefForm = (req, res) => {

    res.render("pages/chef/addChef", {
        user: req.user
    });

};



// Create chef
exports.createChef = async (req, res) => {

    try {

        const { name, speciality, experience } = req.body;

        let image = "";

        if (req.file) {
            image = "/uploads/" + req.file.filename;
        }

        await Chef.create({
            name,
            speciality,
            experience,
            image
        });

        res.redirect("/chef");

    } catch (error) {

        console.log(error);
        res.redirect("/chef/add");

    }

};