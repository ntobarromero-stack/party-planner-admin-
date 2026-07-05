// === Constants ===
const BASE = "https://fsa-crud-2aa9294fe819.herokuapp.com/api";
const COHORT = "/2602-FTB-CT-WEB-PT";
const API = BASE + COHORT;

// === State ===
let parties = [];
let selectedParty;
let rsvps = [];
let guests = [];

/** Updates state with all parties from the API */
async function getParties() {
  try {
    const response = await fetch(API + "/events");
    const result = await response.json();
    parties = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with a single party from the API */
async function getParty(id) {
  try {
    const response = await fetch(API + "/events/" + id);
    const result = await response.json();
    selectedParty = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with all RSVPs from the API */
async function getRsvps() {
  try {
    const response = await fetch(API + "/rsvps");
    const result = await response.json();
    rsvps = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with all guests from the API */
async function getGuests() {
  try {
    const response = await fetch(API + "/guests");
    const result = await response.json();
    guests = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Creates a new party via POST request */
async function createParty(formData) {
  try {
    const response = await fetch(API + "/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    const result = await response.json();
    parties.push(result.data);
    render();
  } catch (e) {
    console.error("Error creating party:", e);
  }
}

/** Deletes a party via DELETE request */
async function deleteParty(id) {
  try {
    await fetch(API + "/events/" + id, {
      method: "DELETE",
    });
    parties = parties.filter((party) => party.id !== id);
    selectedParty = null;
    render();
  } catch (e) {
    console.error("Error deleting party:", e);
  }
}

// === Components ===

/** Form to create a new party */
function CreatePartyForm() {
  const $form = document.createElement("form");
  $form.classList.add("create-form");
  $form.innerHTML = `
    <h3>Add a new party</h3>
    <input type="text" name="name" placeholder="Name" required />
    <textarea name="description" placeholder="Description" required></textarea>
    <input type="datetime-local" name="date" required />
    <input type="text" name="location" placeholder="Location" required />
    <button type="submit">Add party</button>
  `;

  $form.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData($form);
    const partyData = {
      name: formData.get("name"),
      description: formData.get("description"),
      date: formData.get("date"),
      location: formData.get("location"),
    };
    createParty(partyData);
    $form.reset();
  });

  return $form;
}

/** Party name that shows more details about the party when clicked */
function PartyListItem(party) {
  const $li = document.createElement("li");

  if (party.id === selectedParty?.id) {
    $li.classList.add("selected");
  }

  $li.innerHTML = `
    <a href="#selected">${party.name}</a>
  `;
  $li.addEventListener("click", () => getParty(party.id));
  return $li;
}

/** A list of names of all parties */
function PartyList() {
  const $ul = document.createElement("ul");
  $ul.classList.add("parties");

  const $parties = parties.map(PartyListItem);
  $ul.replaceChildren(...$parties);

  return $ul;
}

/** Detailed information about the selected party */
function SelectedParty() {
  if (!selectedParty) {
    const $p = document.createElement("p");
    $p.textContent = "Please select a party to learn more.";
    return $p;
  }

  const $party = document.createElement("section");
  $party.innerHTML = `
    <h3>${selectedParty.name} #${selectedParty.id}</h3>
    <time datetime="${selectedParty.date}">
      ${selectedParty.date.slice(0, 10)}
    </time>
    <address>${selectedParty.location}</address>
    <p>${selectedParty.description}</p>
    <h4>Guests</h4>
    <GuestList></GuestList>
    <DeleteButton></DeleteButton>
  `;
  $party.querySelector("GuestList").replaceWith(GuestList());
  $party.querySelector("DeleteButton").replaceWith(DeleteButton());

  return $party;
}

/** Delete button for the selected party */
function DeleteButton() {
  const $button = document.createElement("button");
  $button.classList.add("delete-btn");
  $button.textContent = "Delete party";
  $button.addEventListener("click", () => deleteParty(selectedParty.id));
  return $button;
}

/** List of guests attending the selected party */
function GuestList() {
  const $ul = document.createElement("ul");
  const guestsAtParty = guests.filter((guest) =>
    rsvps.find(
      (rsvp) => rsvp.guestId === guest.id && rsvp.eventId === selectedParty.id,
    ),
  );

  if (guestsAtParty.length === 0) {
    const $li = document.createElement("li");
    $li.textContent = "No RSVPs yet.";
    $ul.appendChild($li);
  } else {
    const $guests = guestsAtParty.map((guest) => {
      const $guest = document.createElement("li");
      $guest.textContent = guest.name;
      return $guest;
    });
    $ul.replaceChildren(...$guests);
  }

  return $ul;
}

// === Render ===
function render() {
  const $app = document.querySelector("#app");
  $app.innerHTML = `
    <h1>Party Planner</h1>
    <main>
      <section>
        <h2>Upcoming Parties</h2>
        <PartyList></PartyList>
        <CreatePartyForm></CreatePartyForm>
      </section>
      <section id="selected">
        <h2>Party Details</h2>
        <SelectedParty></SelectedParty>
      </section>
    </main>
  `;

  $app.querySelector("PartyList").replaceWith(PartyList());
  $app.querySelector("CreatePartyForm").replaceWith(CreatePartyForm());
  $app.querySelector("SelectedParty").replaceWith(SelectedParty());
}

async function init() {
  await getParties();
  await getRsvps();
  await getGuests();
  render();
}

init();
