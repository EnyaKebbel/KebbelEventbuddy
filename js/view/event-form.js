import { model } from "../model/model.js";

class EventForm extends HTMLElement{
    #mode = "create"; //Entweder editing oder create
    #editingId = undefined;

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
        // Wenn Tags/Teilnehmer geladen werden -> Formular neu rendern
        model.addEventListener("tagsChanged", () => this.render());
        model.addEventListener("participantsChanged", () => this.render());
        // Selection gesetzt und später Editieren - #mode umschalten und Formular vorbefüllen.
        model.addEventListener("selectionChanged", () => {
            const id = model.currentEvent;
            if (id) {
                this.#mode = "edit";
                this.#editingId = id;
            } else {
                this.#mode = "create";
                this.#editingId = undefined;
            }
            this.render();
        });
        this.render();
    }

    render() {
        // Tags/Teilnehmer aus dem Model
        const tags = [...model.tags.values()];
        const participants = [...model.participants.values()];

        const selectedId = model.currentEvent;
        const selectedEvent = selectedId ? model.getEventById(selectedId) : undefined;

        const isEdit = this.#mode === "edit" && selectedEvent

        // Wenn Edit: anhand model.currentEvent Daten vorbefüllen
        const defaultTitle = isEdit ? (selectedEvent.title ?? "") : "";
        const defaultDateTime = isEdit ? (selectedEvent.dateTime ?? "") : "";
        const defaultLocation = isEdit ? (selectedEvent.location ?? "") : "";
        const defaultDescription = isEdit ? (selectedEvent.description ?? "") : "";
        const defaultStatus = isEdit ? (selectedEvent.status ?? "geplant") : "geplant";
        const defaultTagIds = isEdit ? (selectedEvent.tagIds ?? []) : [];
        const defaultParticipantIds = isEdit ? (selectedEvent.participantIds ?? []) : [];

        const tagOptions = tags
            .map(
                (t) =>
                    `<option value="${t.id}" ${
                        defaultTagIds.includes(t.id) ? "selected" : ""
                    }>${t.name}</option>`
            )
            .join("");

        const participantsHtml = participants
            .map((p) => {
                const checked = defaultParticipantIds.includes(p.id) ? "checked" : "";
                return `
          <li class="participants__item">
            <label>
              <input type="checkbox" name="participants" value="${p.id}" ${checked} />
              ${p.name} (${p.email})
            </label>
          </li>
        `;
            })
            .join("");

        this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="/styles/main.css">

      <section class="panel panel--detail">
        <header class="panel__header">
          <h2>${isEdit ? "Event bearbeiten" : "Event anlegen"}</h2>
        </header>

        <form class="event-form" novalidate>
          <div class="form-group">
            <label for="event-title">Titel</label>
            <input id="event-title" name="title" type="text" placeholder="Eventtitel" required minlength="3" value="${this.#escape(
            defaultTitle
        )}" />
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label for="event-datetime">Datum & Uhrzeit</label>
              <input id="event-datetime" name="dateTime" type="datetime-local" required value="${this.#escape(
            defaultDateTime
        )}" />
            </div>

            <div class="form-group">
              <label for="event-location">Ort</label>
              <input id="event-location" name="location" type="text" placeholder="Ort" required minlength="2" value="${this.#escape(
            defaultLocation
        )}" />
            </div>
          </div>

          <div class="form-group">
            <label for="event-description">Beschreibung</label>
            <textarea id="event-description" name="description" rows="5" placeholder="Beschreibung des Events">${this.#escape(
            defaultDescription
        )}</textarea>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label for="event-status">Status</label>
              <select id="event-status" name="status" required>
                <option value="geplant" ${defaultStatus === "geplant" ? "selected" : ""}>Geplant</option>
                <option value="abgeschlossen" ${defaultStatus === "abgeschlossen" ? "selected" : ""}>Abgeschlossen</option>
              </select>
            </div>

            <div class="form-group">
              <label for="event-tags">Tags zuordnen</label>
              <select id="event-tags" name="tagIds" multiple>
                ${tagOptions}
              </select>
              <small style="display:block; opacity:.7; margin-top:6px;">
                Mehrfachauswahl: Strg/Cmd gedrückt halten
              </small>
            </div>
          </div>

          <section class="participants">
            <h3>Teilnehmer zuordnen</h3>
            <ul class="participants__list">
              ${participantsHtml || `<li class="participants__item">Keine Teilnehmer vorhanden.</li>`}
            </ul>
          </section>

          <footer class="form-actions">
            <button type="submit" class="btn btn--primary">Speichern</button>
            <button type="button" class="btn btn--danger btn-cancel">Verwerfen</button>
          </footer>
        </form>
      </section>
    `;

        const form = this.shadowRoot.querySelector("form");
        const cancelBtn = this.shadowRoot.querySelector(".btn-cancel");

        form?.addEventListener("submit", (ev) => {
            ev.preventDefault();
            this.#handleSave(form);
        });

        cancelBtn?.addEventListener("click", () => {
            // zurück zur Liste
            this.dispatchEvent(
                new CustomEvent("cancel-form", { bubbles: true, composed: true })
            );
        });
    }

    #handleSave(form) {
        // 1) HTML5 Validierung
        // (novalidate ist aktiv, deswegen checken und zeigen report)
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // 2) Values holen
        const title = form.querySelector("#event-title")?.value?.trim() ?? "";
        const dateTime = form.querySelector("#event-datetime")?.value ?? "";
        const location = form.querySelector("#event-location")?.value?.trim() ?? "";
        const description =
            form.querySelector("#event-description")?.value?.trim() ?? "";
        const status = form.querySelector("#event-status")?.value ?? "geplant";

        // tagIds (multi select)
        const tagSelect = form.querySelector("#event-tags");
        const tagIds = tagSelect ? [...tagSelect.selectedOptions].map((o) => o.value) : [];

        // participantIds (checkboxes)
        const participantIds = [
            ...form.querySelectorAll('input[name="participants"]:checked'),
        ].map((el) => el.value);

        // 3) Extra Business Validierung
        if (title.length < 3) {
            alert("Titel muss mindestens 3 Zeichen lang sein.");
            return;
        }

        if (!dateTime) {
            alert("Bitte Datum & Uhrzeit wählen.");
            return;
        }

        const dt = new Date(dateTime);
        if (Number.isNaN(dt.getTime())) {
            alert("Datum/Uhrzeit ist ungültig.");
            return;
        }

        if (location.length < 2) {
            alert("Ort muss mindestens 2 Zeichen lang sein.");
            return;
        }

        // 4) Event erzeugen (ID sauber generieren)
        const id = this.#mode === "edit" && this.#editingId
            ? this.#editingId
            : (crypto?.randomUUID ? crypto.randomUUID() : `e${Date.now()}`);

        const payload = {
            id,
            title,
            dateTime,
            location,
            description,
            status,
            tagIds,
            participantIds,
            img: "Images/Event.png", // optional
        };

        // 5) Dispatch an Controller (Model wird NICHT direkt von der View verändert)
        this.dispatchEvent(
            new CustomEvent(this.#mode === "edit" ? "update-event" : "create-event", {
                detail: payload,
                bubbles: true,
                composed: true,
            })
        );

        // Optional: Formular resetten (Controller wechselt sowieso den View)
        // form.reset();
    }

    #escape(str) {
        // Mini-Escaper, damit du nicht aus Versehen HTML kaputt machst
        return String(str ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }
}
customElements.define('event-form', EventForm);