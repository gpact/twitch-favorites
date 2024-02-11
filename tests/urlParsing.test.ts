import { urlToChannel } from "../source/utils/others";

describe("aaaaa", () => {
  it("should return a channel when a valid url is provided", () => {
    expect(urlToChannel("twitch.tv/6rainless")).toBe("6rainless");
    expect(urlToChannel("twitch.tv/6rainless/")).toBe("6rainless");
    expect(urlToChannel("www.twitch.tv/6rainless")).toBe("6rainless");
    expect(urlToChannel("www.twitch.tv/6rainless/")).toBe("6rainless");
    expect(urlToChannel("http://www.twitch.tv/6rainless")).toBe("6rainless");
    expect(urlToChannel("http://www.twitch.tv/6rainless/")).toBe("6rainless");
    expect(urlToChannel("https://www.twitch.tv/6rainless")).toBe("6rainless");
    expect(urlToChannel("https://www.twitch.tv/6rainless/")).toBe("6rainless");
  });

  it("should find the channel name after a raid", () => {
    expect(urlToChannel("twitch.tv/6rainless?raid=true")).toBe("6rainless");
    expect(urlToChannel("www.twitch.tv/6rainless?raid=true")).toBe("6rainless");
  });

  it("should return null for subsections of Twitch which are not streams", () => {
    expect(urlToChannel("www.twitch.tv")).toBeNull();
    expect(urlToChannel("twitch.tv/directory")).toBeNull();
    expect(urlToChannel("twitch.tv/friends")).toBeNull();
    expect(urlToChannel("twitch.tv/subscriptions")).toBeNull();
    expect(urlToChannel("twitch.tv/inventory")).toBeNull();
    expect(urlToChannel("twitch.tv/wallet")).toBeNull();
    expect(urlToChannel("twitch.tv/settings")).toBeNull();
  });

  it("should return null for the user's dashboard", () => {
    expect(urlToChannel("dashboard.twitch.tv/u")).toBeNull();
    expect(urlToChannel("dashboard.twitch.tv/u/6rainless")).toBeNull();
  });
});

