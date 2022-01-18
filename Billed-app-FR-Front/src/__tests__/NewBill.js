import {fireEvent, screen} from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import store from "../__mocks__/store";
import BillsUI from "../views/BillsUI.js";
import {ROUTES, ROUTES_PATH} from "../constants/routes";
import Store from "../app/Store";

const onNavigate = (pathname) => {
    document.body.innerHTML = ROUTES({pathname});
};

describe("Given I am connected as an employee", () => {
    beforeEach(() => {

        window.localStorage.setItem(
            "user",
            JSON.stringify({
                type: "Employee",
            })
        );

        Object.defineProperty(window, "location", {
            value: {
                hash: ROUTES_PATH["NewBill"],
            },
        });

    });
    test("Then there should be 1 more", async () => {
        const postSpy = jest.spyOn(store, "post");
        const testBill = {
            id: "ZeKy5Mo4jkmdfPGYpTxB",
            vat: "",
            amount: 100,
            name: "test",
            fileName: "tester",
            commentary: "ceci est un test",
            pct: 20,
            type: " Services en ligne",
            email: "test@test.com",
            fileUrl:
                "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1200px-React-icon.svg.png",
            date: "2022-01-18",
            status: "pending",
            commentAdmin: "test",
        };
        const allBills = await store.post(testBill);
        expect(postSpy).toHaveBeenCalledTimes(1);
        expect(allBills.data.length).toBe(5);
    });

    /*test("Then should fails with 404 message error", async () => {
      store.post.mockImplementationOnce(() =>
          Promise.reject(new Error("Erreur 404"))
      );
      const html = BillsUI({ error: "Erreur 404" });
      document.body.innerHTML = html;
      const message = await screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });
    test("Then should fails with 500 message error", async () => {
      store.post.mockImplementationOnce(() =>
          Promise.reject(new Error("Erreur 500"))
      );
      const html = BillsUI({ error: "Erreur 500" });
      document.body.innerHTML = html;
      const message = await screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    }); */
    describe("When I upload an PNG file", () => {
        test("Then function handleChangeFile should be called", () => {
            const html = NewBillUI();
            document.body.innerHTML = html;
            jest.spyOn(Store.api, 'post').mockImplementation(store.post)

            const newBill = new NewBill({
                document,
                onNavigate,
                store: Store,
                localStorage: window.localStorage
            });
            const handleChangeFile = jest.fn(newBill.handleChangeFile);
            const file = screen.getByTestId("file");

            file.addEventListener("change", handleChangeFile);
            fireEvent.change(file, {
                target: {
                    files: [new File(["image"], "test.png", {type: "image/png"})]
                }
            });
            expect(handleChangeFile).toHaveBeenCalled();
        });
    })
})
