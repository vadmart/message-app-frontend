// jest.mock("react-native-onesignal");
import React from "react";
import {render, screen, fireEvent, userEvent} from "@testing-library/react-native";
import VerificationForm from "@app/screens/VerificationForm";

jest.mock("react-native/Libraries/EventEmitter/NativeEventEmitter");

describe("Verification form", () => {
    // it("renders correctly", () => {
    //     const tree = renderer.create(<VerificationForm route={{params: {username: "testname", phoneNumber: "+380"}}}/>).toJSON();
    //     expect(tree).toBeDefined();
    // })
    it("enters data correctly", async () => {
        const user = userEvent.setup();
        render(<VerificationForm route={{params: {username: "testname", phoneNumber: "+380"}}}/>);
        // for (let i = 0; i < 6; ++i) {
        //     await user.type(screen.queryAllByRole("text")[i], "1");
        // }
        console.log(screen.queryAllByRole("text"));
    })
})
