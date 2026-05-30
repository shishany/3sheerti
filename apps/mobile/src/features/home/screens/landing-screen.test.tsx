import { render, screen } from "@testing-library/react-native";

import packageJson from "../../../../package.json";
import { LandingScreen } from "./landing-screen";

describe("LandingScreen", () => {
  it("renders the app name and version", () => {
    render(<LandingScreen />);

    expect(screen.getByText("3sheerti")).toBeTruthy();
    expect(screen.getByText(`v${packageJson.version}`)).toBeTruthy();
  });
});
