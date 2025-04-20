module.exports = (io) => {
    io.on("connection", (socket) => {
        console.log("User connected to Bidding:", socket.id);

        socket.on("joinAuction", (auctionId) => {
            socket.join(auctionId);
            console.log(`User ${socket.id} joined auction ${auctionId}`);
        });

        socket.on("placeBid", (data) => {
            console.log("New Bid received:", data);

            // Emit the new bid event with bidder details
            io.to(data.auction).emit("newBid", {
                auctionId: data.auction,
                bidder: data.bidder,  // ✅ Include bidder name
                amount: data.amount
            });

            // Emit the highest bidder update
            io.to(data.auction).emit("highestBidUpdate", {
                auctionId: data.auction,
                highestBidder: data.bidder,
                highestAmount: data.amount
            });
        });

        socket.on("disconnect", () => {
            console.log("User disconnected from Bidding:", socket.id);
        });
    });
};