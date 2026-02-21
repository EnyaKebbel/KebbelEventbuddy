import { model } from "../model/model.js";

class EventDetail extends HTMLElement {
    #event;

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    set event(event) {
        this.#event = event;
        this.render();
    }

    get event() {
        return this.#event;
    }

    connectedCallback() {
        model.addEventListener("selectionChanged", (e) => {
            const id = e.detail;
            this.event = id ? model.getEventById(id) : undefined;
        });
    }

    render() {
        if (!this.#event) {
            this.shadowRoot.innerHTML = `
        <link rel="stylesheet" href="/styles/main.css">
         <section class="panel panel--detail">
        <header class="panel__header">
          <h2>Event-Details</h2>
        </header>
        <p style="padding:16px;">Kein Event ausgewählt.</p>
      </section>
      `;
            return;
        }

        const e = this.#event;

        // Datum formatieren
        const dt = new Date(e.dateTime);
        const date = dt.toLocaleDateString("de-DE");
        const time = dt.toLocaleTimeString("de-DE", {
            hour: "2-digit",
            minute: "2-digit"
        });

        // Tags anzeigen
        const tagsHtml = (e.tagIds ?? [])
            .map(id => model.getTagById(id)?.name ?? id)
            .map(name => `<li>${name}</li>`)
            .join("");

        // Teilnehmer anzeigen
        const participantsHtml = (e.participantIds ?? [])
            .map(id => model.getParticipantById(id))
            .filter(p => p)
            .map(p => `<li>${p.name} (${p.email})</li>`)
            .join("");

        this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="/styles/main.css">

      <section class="panel panel--detail">
        <header class="panel__header panel__header--actions-right">
          <h2>Event-Details</h2>
          <div class="btn-row">
            <button class="btn btn-edit">Bearbeiten</button>
            <button class="btn btn--danger btn-delete">Löschen</button>
          </div>
        </header>

        <article class="event-card event-card--detail">
          <div class="event-card__media">
            <img src="Images/Event.png" alt="Event Icon">
          </div>

          <div class="event-card__content">
            <h3 class="event-card__title">${e.title}</h3>
            <p class="event-card__meta">${date} · ${time} · ${e.location}</p>
            <p class="event-card__meta">Status: ${e.status}</p>
            <p>${e.description ?? ""}</p>

            <ul class="event-card__tags">
              ${tagsHtml}
            </ul>
          </div>
        </article>

        <section class="participants">
          <h3>Teilnehmer</h3>
          <ul class="participants__list">
            ${participantsHtml}
          </ul>
        </section>
      </section>
    `;

        //Event Bearbeiten
        this.shadowRoot.querySelector(".btn-edit")?.addEventListener("click", () => {
            this.dispatchEvent(
                new CustomEvent("edit-event", {
                    detail: e.id,
                    bubbles: true,
                    composed: true
                })
            );
        });

        //Event Löschen
        this.shadowRoot.querySelector(".btn-delete")?.addEventListener("click", () => {
            this.dispatchEvent(
                new CustomEvent("delete-event", {
                    detail: e.id,
                    bubbles: true,
                    composed: true
                })
            );
        });
    }
}

customElements.define("event-detail", EventDetail);