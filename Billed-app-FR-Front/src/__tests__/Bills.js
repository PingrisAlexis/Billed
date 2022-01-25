
import { screen } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import Bills from "../containers/Bills.js"
import userEvent from "@testing-library/user-event"

import store from "../__mocks__/store"


describe("Given I am connected as an employee", () => {
  describe("When I am on Dashboard page but it is loading", () => {
    //Add test
    test("Then, Loading page should be rendered", () => {
      const html = BillsUI({ loading: true })
      document.body.innerHTML = html
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })
  })
  //Add test
  describe('When I am on Dashboard page but back-end send an error message', () => {
    test('Then, Error page should be rendered', () => {
      const html = BillsUI({ error: 'some error message' })
      document.body.innerHTML = html
      expect(screen.getAllByText('Erreur')).toBeTruthy()
    })
  })
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      const user = JSON.stringify({
        type: 'Employee'
      })
      window.localStorage.setItem('user', user)
      const html = BillsUI({ data: []})
      document.body.innerHTML = html

      const icon = screen.getByTestId("icon-window");

      expect(icon.className).toBe("active-icon");
    })
    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)

      expect(dates).toEqual(datesSorted)
    })
  })
  describe("When I click on the new bill's button", () => {
    test("It should renders new bill page", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const bills = new Bills({
        document,
        onNavigate,
        store, 
        localStorage
      });
      const handleClickNewBill = jest.fn((e) => bills.handleClickNewBill(e));
      const addnewBill = screen.getByTestId('btn-new-bill');

      addnewBill.addEventListener("click", handleClickNewBill);

      userEvent.click(addnewBill);

      expect(handleClickNewBill).toHaveBeenCalled();
      expect(screen.queryByText('Envoyer une note de frais')).toBeTruthy()
    });
  })
})

describe("When I click on the icon eye 's button", () => {
  test("It should render the modal", () => {
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
    }
    const html = BillsUI({ data: bills })
    document.body.innerHTML = html
    // const store = null
    const bills1 = new Bills({
      document,
      onNavigate,
      // store,
      localStorage: window.localStorage
    });
    const handleClickIconEye = jest.fn(bills1.handleClickIconEye);

    const modale = document.getElementById("modaleFile")
    $.fn.modal = jest.fn(() => modale.classList.add('show'))
    
    const iconEyes = screen.getAllByTestId('icon-eye');
    const iconEye = iconEyes[1]

    iconEye.addEventListener('click', handleClickIconEye(iconEye));

    userEvent.click(iconEye);
    
    expect(handleClickIconEye).toHaveBeenCalled();
    expect(modale.classList).toContain('show')
  })
})


// test d'intégration GET
describe("Given I am a user connected as Admin", () => {
  describe("When I navigate to Bills", () => {
    test("fetches bills from mock API GET", async () => {
      const getSpy = jest.spyOn(store, "get")
      const bills = await store.get()
      expect(getSpy).toHaveBeenCalledTimes(1)
      expect(bills.data.length).toBe(4)
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      store.get.mockImplementationOnce(() =>
          Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("fetches messages from an API and fails with 500 message error", async () => {
      store.get.mockImplementationOnce(() =>
          Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})