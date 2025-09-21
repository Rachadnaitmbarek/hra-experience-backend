const asyncHandler = require("express-async-handler");
const { default: axiosIns } = require("../../utils/axios");
const { Booking } = require("../../models/Booking");
const { Transaction } = require("../../models/Transaction");
const { TransactionDetails } = require("../../models/TransactionDetails");
const { Wallet } = require("../../models/Wallet");
const { Wishlist } = require("../../models/Wishlist");



module.exports.GetHotelStaticContent = asyncHandler(async (req, res) => {
        //     var url = $"https://travelnext.works/api/hotel_trawexv6/static_content" + $"?from={from}&to={to}&user_id={userId}&user_password={userPassword}" + $"&ip_address={ipAddress}&access={access}&city_name={CityName}&country_name={CountryName}";
        // return res.status(200).json(req.query);
        try {
                const { data } = await axiosIns.get("static_content", {
                        params: {
                                from: req.query.from,
                                to: req.query.to,
                                city_name: req.query.CityName,
                                country_name: req.query.CountryName,
                        }
                })
        
                return res.status(200).json(data);
        } catch (error) {
                return res.status(400).json({
                        error: error.message
                });
        }
        // user_id={userId}&user_password={userPassword}" + $"&ip_address={ipAddress}
})

module.exports.searcHotels = asyncHandler(async (req, res) => {
        try {
                const body = req.body;

                const { data } = await axiosIns.post("hotel_search", {
                        maxResult: 20,
                        resultsPerPage: 20,
                        city_name: body.city_name,
                        country_name: body.country_name,
                        occupancy: body.occupancy,
                        requiredCurrency: "usd",
                        checkin: body.checkin,
                        checkout: body.checkout,
                })
        
                return res.status(200).json(data);
        } catch (error) {
                return res.status(400).json({
                        error: error.message
                });
        }
        // user_id={userId}&user_password={userPassword}" + $"&ip_address={ipAddress}
})

module.exports.GetMoreHotel = asyncHandler(async (req, res) => {
        try {
                let endPoint = "moreResults";
                if(req.query.filterApplying) {
                        endPoint = "filterResultsPagination";
                }
                const { data } = await axiosIns.get(endPoint, {
                        params: {
                                maxResult: 20,
                                nextToken: req.query.TokenId,
                                sessionId: req.query.SessionId,
                                filterKey: req.query.filterApplying
                        }
                })
        
                return res.status(200).json(data);
        } catch (error) {
                return res.status(400).json({
                        error: error.message
                });
        }
        // user_id={userId}&user_password={userPassword}" + $"&ip_address={ipAddress}
})


module.exports.GetHotelContent = asyncHandler(async (req, res) => {
        try {
                const { data } = await axiosIns.get("hotelDetails", {
                        params: {
                                hotelId: req.query.hotelId,
                                productId: req.query.productId,
                                tokenId: req.query.TokenId,
                                sessionId: req.query.SessionId,
                        }
                })
        
                return res.status(200).json(data);
        } catch (error) {
                return res.status(400).json({
                        error: error.message
                });
        }
        // user_id={userId}&user_password={userPassword}" + $"&ip_address={ipAddress}
})


module.exports.GetRoomRates = asyncHandler(async (req, res) => {
        try {
                const { data } = await axiosIns.post("get_room_rates", {
                        hotelId: req.body.HotelId,
                        productId: req.body.ProductId,
                        tokenId: req.body.TokenId,
                        sessionId: req.body.SessionId,
                })
        
                return res.status(200).json(data);
        } catch (error) {
                return res.status(400).json({
                        error: error.message
                });
        }
        // user_id={userId}&user_password={userPassword}" + $"&ip_address={ipAddress}
})

module.exports.HotelBooking = asyncHandler(async (req, res) => {
        try {
                const customer = req.user
                const wallet = await customer.getWallet();
                const loanBalance =  wallet.getLoanBalance();
                const netPrice = +req.body.netPrice;
                if(loanBalance < netPrice) {
                        return res.status(400).json({
                                message: "U dont have enogh balance to use it"
                        });
                }
                
                const { data } = await axiosIns.post("hotel_book", req.body)
                if(data.status == "CONFIRMED") {
                        const price = data.roomBookDetails.NetPrice;

                        let loan = 0;
                        if(wallet.balance - price < 0) {
                                loan = wallet.balance <= 0 ? price : Math.abs(wallet.balance - price); 
                        }
                        
                        const bookData = {
                                userId: customer._id,
                                type: "hotel",
                                productId: data.productId,
                                referenceNum: data.referenceNum,
                                supplierConfirmationNum: data.supplierConfirmationNum,
                                checkin: new Date(data.roomBookDetails.checkIn),
                                checkout: new Date(data.roomBookDetails.checkOut),
                                amount: Math.round(price),
                                isRefundable: data.roomBookDetails.fareType == "Refundable",
                                state: "confirmed"
                        };

                        const book = await Booking.create(bookData); 

                        const transaction = await Transaction.create({
                                userId: customer._id,
                                bookingId: book._id,
                                stripeInvoiceId: null,
                                type: "booking",
                                amount: price,
                                direction: "debit",
                                balanceFrom: wallet.balance,
                                balanceTo: wallet.balance - price,
                                paymentDate: new Date(),
                                status: "completed"
                        })
        
                        await TransactionDetails.create({
                                userId: customer._id,
                                transactionId: transaction._id,
                                source: "wallet",
                                direction: "debit",
                                amount: price - loan,
                        })

                        if(loan > 0) {
                                await TransactionDetails.create({
                                        userId: customer._id,
                                        transactionId: transaction._id,
                                        source: "loan",
                                        direction: "debit",
                                        amount: loan,
                                })
                        }

                        
                        await Wallet.findByIdAndUpdate(
                                wallet._id,
                                { 
                                        balance:  wallet.balance - price,
                                        loanUsed: wallet.loanUsed + loan
                                },
                        );
                }

                return res.status(200).json(data);
        } catch (error) {
                return res.status(400).json({
                        error: error.message
                });
        }
})


module.exports.AddFavouriteHotel = asyncHandler(async (req, res) => {
        try {
                const customer = req.user
                const wishlist = await Wishlist.create({
                      userId: customer._id, 
                      type: "hotel", 
                      referenceId: req.body.HotelId,
                      productId: req.body.productId
                })
                return res.status(200).json({
                        data: {},
                        success: true
                });
        } catch (error) {
                return res.status(400).json({
                        error: error.message
                });
        }
})


function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}


async function getHotels(hotelsIds) {
        const checkin = new Date();
        const checkout = new Date(checkin);
        checkout.setDate(checkout.getDate() + 1)
        const { data } = await axiosIns.post('hotel_search', {
                        hotelCodes: hotelsIds,
                        checkin: formatDate(checkin),
                        checkout: formatDate(checkout),
                        occupancy: [
                                {
                                        "room_no": 1,
                                        "adult": 2,
                                        "child": 0,
                                        "child_age": [
                                                0
                                        ]
                                },
                        ],
                        requiredCurrency: "usd"
        });
        
        return data.itineraries;
}

module.exports.favourites = asyncHandler(async (req, res) => {
        try {
                const customer = req.user

                const wishlists = await Wishlist.find({
                        userId: customer._id,
                        type: "hotel"
                });

                const hotelsIds = wishlists.map((elt) => {
                        return elt.referenceId
                })

                const hotels = await getHotels(hotelsIds)
                return res.status(200).send({
                        data: hotels,
                        succes: true
                })
        } catch (error) {
                return res.status(400).json({
                        error: error.message
                });
        }
})


module.exports.HotelFilter = asyncHandler(async (req, res) => {
        try {
                const { data } = await axiosIns.post("filterResults", {
                        ...req.body,
                        sessionId: req.query.sessionId,
                        maxResult: 20,
                })
                
                return res.status(200).json(data);
        } catch (error) {
                return res.status(400).json({
                        error: error.message
                });
        }
})


