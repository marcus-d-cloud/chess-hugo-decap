// VanillaCalendar minimal (adapted for Hugo, v3.0.0)
class VanillaCalendar {
  constructor(el, options) {
    this.el = el;
    this.options = options;
    this.date = options.date || new Date();
    this.events = options.events || [];
    this.selectedDate = options.selectedDate || this.toDateKey(new Date());
    this.render();
  }

  toDateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  formatDateLabel(dateStr) {
    const date = new Date(`${dateStr}T00:00:00`);
    return date.toLocaleDateString('de-DE', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  isDateInCurrentMonth(dateStr, year, month) {
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}-`;
    return typeof dateStr === 'string' && dateStr.startsWith(prefix);
  }

  syncSelectedDate(year, month) {
    if (this.isDateInCurrentMonth(this.selectedDate, year, month)) {
      return;
    }

    const prefix = `${year}-${String(month + 1).padStart(2, '0')}-`;
    const firstEventDate = this.events.find((e) => e.date && e.date.startsWith(prefix));
    this.selectedDate = firstEventDate ? firstEventDate.date : `${prefix}01`;
  }

  formatTime(start) {
    if (!start) {
      return '';
    }
    const parsed = new Date(start);
    if (Number.isNaN(parsed.getTime())) {
      return '';
    }
    return parsed.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  render() {
    const d = new Date(this.date);
    const year = d.getFullYear();
    const month = d.getMonth();
    const today = new Date();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay() || 7;
    this.syncSelectedDate(year, month);
    this.el.innerHTML = '';

    const shell = document.createElement('div');
    shell.className = 'vanilla-calendar__shell';

    // Header
    const header = document.createElement('div');
    header.className = 'vanilla-calendar__header';
    const prev = document.createElement('button');
    prev.className = 'vanilla-calendar__arrow';
    prev.innerHTML = '&lt;';
    prev.onclick = () => { this.date.setMonth(this.date.getMonth() - 1); this.render(); };
    const next = document.createElement('button');
    next.className = 'vanilla-calendar__arrow';
    next.innerHTML = '&gt;';
    next.onclick = () => { this.date.setMonth(this.date.getMonth() + 1); this.render(); };
    const title = document.createElement('span');
    title.className = 'vanilla-calendar__title';
    title.textContent = d.toLocaleString('de-DE', { month: 'long', year: 'numeric' });
    header.appendChild(prev); header.appendChild(title); header.appendChild(next);
    shell.appendChild(header);

    // Weekdays
    const week = document.createElement('div');
    week.className = 'vanilla-calendar__week';
    ['Mo','Di','Mi','Do','Fr','Sa','So'].forEach(wd => {
      const w = document.createElement('span');
      w.textContent = wd;
      week.appendChild(w);
    });
    shell.appendChild(week);

    // Days
    const days = document.createElement('div');
    days.className = 'vanilla-calendar__days';
    for (let i = 1; i < firstDay; i++) {
      const empty = document.createElement('span');
      empty.className = 'vanilla-calendar__day vanilla-calendar__day--empty';
      days.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
      const dayEvents = this.events.filter(e => e.date === dateStr);
      const hasEvent = dayEvents.length > 0;
      const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
      const btn = document.createElement('button');
      btn.className = 'vanilla-calendar__day';
      btn.type = 'button';
      if (isToday) btn.classList.add('vanilla-calendar__day--today');
      if (hasEvent) btn.classList.add('vanilla-calendar__day--event');
      if (this.selectedDate === dateStr) {
        btn.classList.add('vanilla-calendar__day--selected');
      }

      const dayNumber = document.createElement('span');
      dayNumber.className = 'vanilla-calendar__day-number';
      dayNumber.textContent = day;
      btn.appendChild(dayNumber);

      if (hasEvent) {
        const badge = document.createElement('span');
        badge.className = 'vanilla-calendar__event-badge';
        badge.textContent = `${dayEvents.length}`;
        btn.appendChild(badge);

        const preview = document.createElement('div');
        preview.className = 'vanilla-calendar__event-preview';
        dayEvents.slice(0, 2).forEach((eventItem) => {
          const line = document.createElement('span');
          line.className = 'vanilla-calendar__event-line';
          line.textContent = eventItem.title;
          preview.appendChild(line);
        });
        btn.appendChild(preview);

        btn.title = dayEvents.map(e => e.title).join(', ');
      }

      btn.onclick = () => {
        this.selectedDate = dateStr;
        this.render();
      };
      days.appendChild(btn);
    }

    shell.appendChild(days);

    const details = document.createElement('div');
    details.className = 'vanilla-calendar__details';
    const selectedEvents = this.events.filter(e => e.date === this.selectedDate);

    const detailsTitle = document.createElement('h3');
    detailsTitle.className = 'vanilla-calendar__details-title';
    detailsTitle.textContent = this.formatDateLabel(this.selectedDate);
    details.appendChild(detailsTitle);

    if (selectedEvents.length === 0) {
      const emptyText = document.createElement('p');
      emptyText.className = 'vanilla-calendar__details-empty';
      emptyText.textContent = 'Keine Termine an diesem Tag.';
      details.appendChild(emptyText);
    } else {
      const list = document.createElement('div');
      list.className = 'vanilla-calendar__details-list';

      selectedEvents.forEach((eventItem) => {
        const card = document.createElement('article');
        card.className = 'vanilla-calendar__event-card';

        const eventTitle = document.createElement('h4');
        eventTitle.className = 'vanilla-calendar__event-title';
        eventTitle.textContent = eventItem.title;
        card.appendChild(eventTitle);

        const timeLabel = this.formatTime(eventItem.start);
        if (timeLabel) {
          const eventTime = document.createElement('p');
          eventTime.className = 'vanilla-calendar__event-time';
          eventTime.textContent = timeLabel;
          card.appendChild(eventTime);
        }

        if (eventItem.url) {
          const link = document.createElement('a');
          link.className = 'vanilla-calendar__event-link';
          link.href = eventItem.url;
          link.textContent = 'Zum Termin';
          card.appendChild(link);
        }

        list.appendChild(card);
      });

      details.appendChild(list);
    }

    this.el.appendChild(shell);
    this.el.appendChild(details);
  }
}
window.VanillaCalendar = VanillaCalendar;