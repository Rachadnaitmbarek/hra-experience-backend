const router = require("express").Router();
const { GetHotelStaticContent, 
        searcHotels, 
        GetMoreHotel, 
        GetHotelContent, 
        GetRoomRates, 
        HotelBooking, 
        AddFavouriteHotel,
        favourites,
        HotelFilter
} = require("../../controllers/app/hotelsController");
const { verifyToken } = require("../../middlewares/verifyToken");



router.route("/GetHotelStaticContent").get(GetHotelStaticContent)
router.route("/hotelsearch").post(searcHotels)
router.route("/GetMoreHotel").get(GetMoreHotel)
router.route("/GetHotelContent").get(GetHotelContent)
router.route("/GetRoomRates").post(GetRoomRates)
router.route("/HotelBooking").post(verifyToken, HotelBooking)
router.route("/AddFavouriteHotel").post(verifyToken, AddFavouriteHotel)
router.route("/favourites/:userId").get(verifyToken, favourites)
router.route("/HotelFilter").post(HotelFilter)
// router.route("/HotelFilter").get(verifyToken, HotelFilter)

module.exports = router;