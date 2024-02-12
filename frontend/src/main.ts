import "./style.css";
import { z } from "zod";

const CountrySchema = z.object({
  id: z.number(),
  name: z.string(),
  population: z.number(),
});

//set up query params
const minElement = document.getElementById("min") as HTMLInputElement;
const maxElement = document.getElementById("max") as HTMLInputElement;
const searchButton = document.getElementById("search") as HTMLButtonElement;

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
        `<p>${country.name} has a population of: ${country.population}</p><button id="${country.id}" class="deleteButton, btn btn-primary h-[2rem]">DELETE</button>`
    )
    .join("");

  const appElement = document.getElementById("app") as HTMLDivElement;
  appElement.innerHTML = countryContent;

  const deleteButtons = document.getElementsByClassName("deleteButton");

  [...deleteButtons].forEach((button) =>
    button.addEventListener("click", async () => {
      await deleteData(button.id);
      fetchData();
    })
  );
};

//searchButton.addEventListener("click", fetchData);

minElement.addEventListener("input", fetchData);
maxElement.addEventListener("input", fetchData);

//POST
const countryInput = document.getElementById("nameInput") as HTMLInputElement;
const populationInput = document.getElementById(
  "populationInput"
) as HTMLInputElement;
const postButton = document.getElementById("postButton") as HTMLButtonElement;

const postData = async () => {
  let response = null;

  try {
    response = await fetch("http://localhost:4001/api/countries", {
      method: "post",
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

//DELETE

//get buttons

const deleteData = async (id: string) => {
  let response = null;
  try {
    response = await fetch(`http://localhost:4001/api/countries/${id}`, {
      method: "delete",
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

//PATCH
//homework