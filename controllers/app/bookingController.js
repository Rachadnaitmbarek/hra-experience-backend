const asyncHandler = require("express-async-handler");
const { Booking } = require("../../models/Booking");
const { default: axiosIns } = require("../../utils/axios");

async function getBookingDetails(booking) {
        const { data } = await axiosIns.post('bookingDetails', {
                supplierConfirmationNum: booking.supplierConfirmationNum,
                referenceNum: booking.referenceNum,
        });
        return data.roomBookDetails;
}

async function getBookingHotel(hotelId, productId) {
        const { data } = await axiosIns.get('hotelDetails', {
                params: {
                        hotelId: hotelId,
                        productId: productId,
                        sessionId: productId,
                        tokenId: productId,
                }
        });
        
        return data;
}

module.exports.getAll = asyncHandler(async (req, res) => {
        const customer = req.user
        const whereQuery = {
                userId: customer._id
        }

        switch (req.query.status) {
                case "Completed":
                        whereQuery[''] = "confirmed";
                        break;
                case "Refunded":
                        whereQuery['state'] = "canceled";
                        break;
                default:
                        break;
        }
        // Completed
        const bookingsList = await Booking.find(whereQuery);
        const bookings = []
        for (let i = 0; i < bookingsList.length; i++) {
                const booking = bookingsList[i];
                const details = await getBookingDetails(booking)
                const hotel = await getBookingHotel(details.hotelId, booking.productId)
                // return res.status(400).send(hotel)
                bookings.push({
                        id: booking._id, 
                        startDate: booking.checkin, 
                        endDate: booking.checkout, 
                        createDate: booking.createdAt, 
                        status: booking.state, 
                        statusId: booking.state == "confirmed" ? 1 : 0, 
                        hotelRoom: details,
                        hotel: hotel,
                        deposit: booking.amount,
                })
                
        }

        return res.status(200).send({
                data: bookings,
                success: true
        });
})


module.exports.getBooking = asyncHandler(async (req, res) => {
        const customer = req.user
        // Completed
        const booking = await Booking.findOne({
                _id: req.params.booking
        });
        const details = await getBookingDetails(booking)
        const hotel = await getBookingHotel(details.hotelId, booking.productId)
        const bookingData = {
                id: booking._id, 
                startDate: booking.checkin, 
                endDate: booking.checkout, 
                createDate: booking.createdAt, 
                status: booking.state, 
                statusId: booking.state == "confirmed" ? 1 : 0, 
                hotelRoom: details,
                hotel: hotel,
                deposit: booking.amount,
        }

        return res.status(200).send({
                data: bookingData,
                success: true
        });
})
