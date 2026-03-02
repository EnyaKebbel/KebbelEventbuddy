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
        <link rel="stylesheet" href="./styles/main.css">
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
            .map(name => `<li>${this.#escape(name)}</li>`)
            .join("");

        // Teilnehmer anzeigen
        const participantsHtml = (e.participantIds ?? [])
            .map(id => model.getParticipantById(id))
            .filter(p => p)
            .map((p) => {
                const avatar = this.#avatarPath(p.avatarUrl);
                return `
                  <li class="participants__item">
                    <img class="participants__avatar" src="${avatar}" alt="${this.#escape(p.name)}" loading="lazy">
                    <div class="participants__info">
                      <span class="participants__name">${this.#escape(p.name)}</span>
                      <span class="participants__email">${this.#escape(p.email)}</span>
                    </div>
                  </li>
                `;
            })
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
            <h3 class="event-card__title">${this.#escape(e.title)}</h3>
            <p class="event-card__meta">${date} · ${time} · ${this.#escape(e.location)}</p>
            <p class="event-card__meta">Status: ${this.#escape(e.status)}</p>
            <p>${this.#escape(e.description ?? "")}</p>

            <ul class="event-card__tags">
              ${tagsHtml}
            </ul>
          </div>
        </article>

        <section class="participants">
          <h3>Teilnehmer</h3>
          <ul class="participants__list">
             ${participantsHtml || `<li class="participants__empty">Keine Teilnehmer zugeordnet.</li>`}
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

    #avatarPath(avatarUrl) {
        const raw = String(avatarUrl ?? "").trim();
        if (!raw) return "Images/Event.png";
        const file = raw.split("/").pop();
        return file ? `Images/${file}` : "Images/Event.png";
    }

    #escape(str) {
        return String(str ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }
}
customElements.define("event-detail", EventDetail);