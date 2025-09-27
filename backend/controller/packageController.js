const Package = require ("../model/packageSchema");


const getPackages = async (req, res) => {
    try {
        const packages = await Package.find();
        res.status(200).json(packages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const addPackage = async (req,res)=>{
    const {name,description,price,icon}=req.body;
        if (!name || !description || !price) {
        return res.status(400).send('Name, description, and price are required.');
        }
    try {
        const newPackage= new Package({
            name,
            description,
            price,
            icon:req.file.path
        })

        await newPackage.save();
             res.status(201).json({ message: 'Package added successfully', package: newPackage });
    } catch (err) {
        console.error('Error adding package:', err);
        res.status(500).send('An error occurred while adding the package.');
    }
}


const updatePackage = async (req, res) => {
    const { id } = req.params;
    const {name, description, price, icon } = req.body;
    try {
        const updatedPackage = await Package.findByIdAndUpdate(
            id,
            { name, description, price, icon },
            { new: true, runValidators: true }
        );

        if (!updatedPackage) {
            return res.status(404).json({ message: "Package not found" });
        }
        res.status(200).json({ message: "Package updated successfully", package: updatedPackage });
    } catch (err) {
        console.error("Failed to update package:", err);
        res.status(500).json({ message: "Failed to update package", error: err.message });
    }
};




const deletePackage = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedPackage = await Package.findByIdAndDelete(id);
        if (!deletedPackage) {
            return res.status(404).json({ message: "Package not found" });
        }
        res.status(200).json({ message: "Package deleted successfully" });
    } catch (err) {
        console.error("Failed to delete package:", err);
        res.status(500).json({ message: "Failed to delete package", error: err.message });
    }
};

module.exports ={
    getPackages,
    addPackage,
    updatePackage,
    deletePackage
}