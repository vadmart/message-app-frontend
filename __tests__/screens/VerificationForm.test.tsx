// jest.mock("react-native-onesignal");
import React from "react";
import renderer from "react-test-renderer";
import VerificationForm from "@app/screens/VerificationForm";

jest.mock("react-native/Libraries/EventEmitter/NativeEventEmitter");

describe("Verification form", () => {
    it("enters data correctly", () => {
        const elem = renderer.create(<VerificationForm route={{params: {username: "testname", phoneNumber: "+380"}}}/>);
        console.log(elem);
    })
})
