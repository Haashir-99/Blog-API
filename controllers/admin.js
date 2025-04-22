exports.getAllUsers = async (req, res, next) => {
    res.status(200).json({ message: "Get all users route" });
}