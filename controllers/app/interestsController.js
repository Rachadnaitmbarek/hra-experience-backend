const asyncHandler = require("express-async-handler");
const { Interest } = require("../../models/Interest");
const { UserInterest } = require("../../models/UserInterest");


module.exports.getAll = asyncHandler(async (req, res) => {
        // await Interest.deleteMany({});
        // const interests = [
        //         { 
        //                 id: 1, 
        //                 name: "Photography", 
        //                 imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60" 
        //         },
        //         { 
        //                 id: 2, 
        //                 name: "Travel", 
        //                 imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60" 
        //         },
        //         { 
        //                 id: 3, 
        //                 name: "Cooking", 
        //                 imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60" 
        //         },
        //         { 
        //                 id: 4, 
        //                 name: "Music", 
        //                 imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60" 
        //         },
        //         { 
        //                 id: 5,
        //                 name: "Sports", 
        //                 imageUrl: "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60" 
        //         },
        // ];
 
        // const inserted = await Interest.insertMany(interests);
        res.status(200).json({
                data: await Interest.find(),
                success: true
        });
});


module.exports.addInterest = asyncHandler(async (req, res) => {
        await UserInterest.deleteMany({ userId: req.user._id });
        const interestIds = req.body.interestIds;
        const promises = interestIds.map(async (id) => {
                const interest = await Interest.findOne({ id });
                return {
                        userId: req.user._id,
                        interestId: interest._id,
                }
        })
        const data = await Promise.all(promises);
        await UserInterest.insertMany(data);

        res.status(200).json({
                data: req.user,
                success: true
        });
})