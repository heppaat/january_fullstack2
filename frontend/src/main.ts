import "./style.css";
import { z } from "zod";

const CountrySchema = z.object({
  id: z.number(),
  name: z.string(),
  population: z.number(),
});

//set up query params for GET
const minElement = document.getElementById("min") as HTMLInputElement;
const maxElement = document.getElementById("max") as HTMLInputElement;
const searchButton = document.getElementById("search") as HTMLButtonElement;

//get elements for PATCH
const patchName = document.getElementById("patchName") as HTMLInputElement;
const patchPopulation = document.getElementById(
  "patchPopulation"
) as HTMLInputElement;

//get mainDIV and save /cancel buttons for MODIFY/PATCH
const patchDiv = document.getElementById("modifyDiv") as HTMLDivElement;
const saveButton = document.getElementById("save") as HTMLButtonElement;
const cancelButton = document.getElementById("cancel") as HTMLButtonElement;

const hideModifyPatchWindow = () => {
  patchDiv.style.display = "none";
};
cancelButton.addEventListener("click", hideModifyPatchWindow);

const showModifyPatchWindow = () => {
  patchDiv.style.display = "flex";
};

//global variable for save buttonId
let saveButtonId: number | null = null;

saveButton.addEventListener("click", async () => {
  await patchData();
  hideModifyPatchWindow();
  fetchData();
});

// GETDATA from server

const fetchData = async () => {
  if (!minElement.value) {
    return;
  }
  let response = null;
  try {
    response = await fetch(
      `http://localhost:4001/api/countries?min=${minElement.value}&max=${maxElement.value}`
    );
  } catch (error) {}

  //if no internet, network error
  if (response === null) return alert("network error");
  //if query params are invalid
  if (response.status >= 400 && response.status < 500) {
    return alert("Invalid params");
  }
  //if server has error
  if (response.status >= 500) {
    return alert("server error");
  }

  const countries = await response.json();
  const result = CountrySchema.array().safeParse(countries);

  if (!result.success) return alert("OOPS");

  const validatedData = result.data;

  const countryContent = validatedData
    .map(
      (country) =>
        `<p>${country.name} has a population of: ${country.population}</p><button id="${country.id}delete" class="deleteButton btn btn-primary">DELETE</button><button id="${country.id}patch" class="patchButton btn btn-secondary">PATCH</button>`
    )
    .join("");

  const appElement = document.getElementById("app") as HTMLDivElement;
  appElement.innerHTML = countryContent;

  const deleteButtons = document.getElementsByClassName("deleteButton");

  [...deleteButtons].forEach((button) =>
    button.addEventListener("click", async () => {
      await deleteData(button.id.split("delete")[0]);
      fetchData();
    })
  );

  const patchButtons = document.getElementsByClassName("patchButton");

  //what happens when you click on PATCH/MODIFY button?

  [...patchButtons].forEach((button) =>
    button.addEventListener("click", async () => {
      showModifyPatchWindow();
      saveButtonId = +button.id.split("patch")[0];
      patchName.value = validatedData.find(
        (country) => country.id === saveButtonId
      )!.name;
      patchPopulation.value =
        "" +
        validatedData.find((country) => country.id === saveButtonId)!
          .population;
    })
  );
};

//searchButton.addEventListener("click", fetchData);

minElement.addEventListener("input", fetchData);
maxElement.addEventListener("input", fetchData);

//POSTDATA to server

const countryInput = document.getElementById("nameInput") as HTMLInputElement;
const populationInput = document.getElementById(
  "populationInput"
) as HTMLInputElement;
const postButton = document.getElementById("postButton") as HTMLButtonElement;

const postData = async () => {
  let response = null;

  try {
    response = await fetch("http://localhost:4001/api/countries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: countryInput.value,
        population: +populationInput.value,
      }),
    });
  } catch (error) {}

  //if no internet, network error
  if (response === null) return alert("network error");

  //if body input is invalid
  if (response.status >= 400 && response.status < 500)
    return alert("Invalid body input");

  //if server has error
  if (response.status >= 500) return alert("server error");

  alert("Success");
};

postButton.addEventListener("click", async () => {
  await postData();
  fetchData();
});

//DELETEDATA from server

const deleteData = async (id: string) => {
  let response = null;
  try {
    response = await fetch(`http://localhost:4001/api/countries/${id}`, {
      method: "DELETE",
    });
  } catch (error) {}

  //if no internet, network error
  if (response === null) return alert("network error");

  //client error? - not implemented
  if (response.status >= 400 && response.status < 500)
    return alert("Client error");

  //if server has error
  if (response.status >= 500) return alert("server error");

  alert("Success");
};

//PATCHDATA on server

const patchData = async () => {
  let response = null;
  try {
    response = await fetch(
      `http://localhost:4001/api/countries/${saveButtonId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: patchName.value,
          population: +patchPopulation.value,
        }),
      }
    );
  } catch (error) {}

  //if no internet, network error
  if (response === null) return alert("network error");

  //client error
  if (response.status >= 400 && response.status < 500)
    return alert("Invalid body input");

  //if server has error
  if (response.status >= 500) return alert("server error");

  alert("Success");
};

//--------------ABSZTRAKCIO--------------------------

//ABSZTRAKCIO FETCH FUNKCIORA AMIT MINDEN METHODNAL HASZNALHATNANK
const safeFetch = async (url: string, method: string, data?: any) => {
  let response = null;
  try {
    (response = await fetch(url)),
      {
        method: method,
        headers: data ? { "Content-Type": "application/json" } : {},
        body: data ? JSON.stringify(data) : undefined,
      };
  } catch (error) {}

  //if no internet, network error
  if (response === null) return alert("network error");

  //client error
  if (response.status >= 400 && response.status < 500)
    return alert("Invalid body input");

  //if server has error
  if (response.status >= 500) return alert("server error");

  alert("Success");
};

//____-_______----PATCH ABSZTRAKCIOVAL--------_______-_______

const patchDataAbstraction = async () => {
  safeFetch(`http://localhost:4001/api/countries/${saveButtonId}`, "PATCH", {
    name: patchName.value,
    population: +patchPopulation.value,
  });
};

const deleteDataAbstraction = async (id: string) => {
  safeFetch(`http://localhost:4001/api/countries/${id}`, "DELETE");
};

const postDataAbstraction = async () => {
  safeFetch("http://localhost:4001/api/countries", "POST", {
    name: countryInput.value,
    population: +populationInput.value,
  });
};

const fetchDataAbstraction = async () => {};
