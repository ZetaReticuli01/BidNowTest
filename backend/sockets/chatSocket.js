module.exports = (io) => {
    io.on("connection", (socket) => {
        console.log(`WebSocket Connected: ${socket.id}`)

        socket.onAny((event, ...args) => {
            console.log(`Event Received: ${event}`, args)
        })

        socket.emit("receiveMessage", { message: "Test message from backend" })

        socket.on("sendMessage", (data) => {
            console.log("Received Message from Client:", data)

            if (!data || !data.data.auction || !data.data.message) {
                console.log("Invalid message format received:", data)
                return
            }
            const { auction, message } = data.data;


            io.emit("receiveMessage", {
                auction,
                message,
                sender: "Backend Server"
            })

            console.log("Sent message back to all clients via receiveMessage")
        })

        socket.on("disconnect", () => {
            console.log(`WebSocket Disconnected: ${socket.id}`)
        })
    })
}
