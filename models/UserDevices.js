const { default: mongoose } = require("mongoose");
const { User } = require("./User");


const UserDeviceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    token: {
        type: String,
        default: ""
    },
    deviceId: {
        type: String,
        default: ""
    },
    ipAddress: {
        type: String,
        default: ""
    },
    deviceName: {
        type: String,
        default: ""
    },
    deviceModel: {
        type: String,
        default: ""
    },
    versionNumber: {
        type: String,
        default: ""
    },
    versionCode: {
        type: String,
        default: ""
    },
    platform: {
        type: String,
        default: ""
    },
    disconnected: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

const UserDevice = mongoose.model("UserDevice", UserDeviceSchema);

module.exports = {
    UserDevice
}