import { CourierClient } from "@trycourier/courier";

const courier = CourierClient({
    authorizationToken: process.env.COURIER_TOKEN,
});

const sendVerificationMessage = (params, mobileNumber) => {
    return courier.send({
    message: {
        to: {
            data: params,
            phone_number: mobileNumber,
        },
        content: {
            title: "XYZ Verification",
            body: "Hi {{name}},\nYour verification code for XYZ is {{otp}}.",
        },
        routing: {
            method: "single",
            channels: ["sms"],
        },
    },
    });
};
