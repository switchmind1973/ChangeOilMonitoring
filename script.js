if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('ChangeOilMonitoring/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    });
}

document.addEventListener('DOMContentLoaded', function () {
  const oilChangeForm = document.getElementById('oilChangeForm');
  const lastEngineOil = document.getElementById('lastEngineOil');
  const nextEngineOil = document.getElementById('nextEngineOil');
  const lastGearOil = document.getElementById('lastGearOil');
  const nextGearOil = document.getElementById('nextGearOil');
  const historyTableBody = document.querySelector('#historyTable tbody');
  const toast = document.getElementById('toast');
  const resetButton = document.getElementById('resetButton');

  // Load oilChangeLog from localStorage or initialize as empty array
  let oilChangeLog = JSON.parse(localStorage.getItem('oilChangeLog')) || [];

  oilChangeForm.addEventListener('submit', function (event) {
      event.preventDefault();

      const oilType = document.getElementById('oilType').value;
      const date = document.getElementById('date').value;
      const mileage = parseInt(document.getElementById('mileage').value);

      // Format date as "Month Day, Year"
      const formattedDate = new Date(date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
      });

      oilChangeLog.push({ oilType, date: formattedDate, mileage });
      localStorage.setItem('oilChangeLog', JSON.stringify(oilChangeLog)); // Save to localStorage
      updateDashboard();
      updateHistory();
      oilChangeForm.reset();

      // Show toast notification for new entry
      showToast(`New ${oilType === 'engine' ? 'Engine Oil' : 'Gear Oil'} entry added!`);
  });

  resetButton.addEventListener('click', function () {
      oilChangeLog = []; // Clear the log
      localStorage.removeItem('oilChangeLog'); // Remove from localStorage
      updateDashboard();
      updateHistory();
      showToast('Oil change history reset!');
  });

  function updateDashboard() {
      const engineOilLog = oilChangeLog.filter(entry => entry.oilType === 'engine');
      const gearOilLog = oilChangeLog.filter(entry => entry.oilType === 'gear');

      // Engine Oil
      if (engineOilLog.length > 0) {
          const lastEntry = engineOilLog[engineOilLog.length - 1];
          lastEngineOil.innerHTML = `Last Change: ${lastEntry.date}, ${lastEntry.mileage} km`;

          // Find the beginning of the current cycle
          let beginningMileage = lastEntry.mileage;
          for (let i = engineOilLog.length - 1; i >= 0; i--) {
              if (i === 0 || engineOilLog[i].mileage <= engineOilLog[i - 1].mileage) {
                  beginningMileage = engineOilLog[i].mileage;
                  break;
              }
          }

          const targetOdo = beginningMileage + 1500; // Target ODO for Engine Oil
          const remainingKm = targetOdo - lastEntry.mileage;

          if (remainingKm <= 0) {
              // Reset cycle if target ODO is reached
              nextEngineOil.innerHTML = `Next Change at: ${lastEntry.mileage + 1500} km<br>Remaining: 1500 km`;
              showToast('Engine Oil cycle reset!');
          } else {
              nextEngineOil.innerHTML = `Next Change at: ${targetOdo} km<br>Remaining: ${remainingKm} km`;
          }
      } else {
          lastEngineOil.textContent = 'No data';
          nextEngineOil.textContent = 'No data';
      }

      // Gear Oil
      if (gearOilLog.length > 0) {
          const lastEntry = gearOilLog[gearOilLog.length - 1];
          lastGearOil.innerHTML = `Last Change: ${lastEntry.date}, ${lastEntry.mileage} km`;

          // Find the beginning of the current cycle
          let beginningMileage = lastEntry.mileage;
          for (let i = gearOilLog.length - 1; i >= 0; i--) {
              if (i === 0 || gearOilLog[i].mileage <= gearOilLog[i - 1].mileage) {
                  beginningMileage = gearOilLog[i].mileage;
                  break;
              }
          }

          const targetOdo = beginningMileage + 6000; // Target ODO for Gear Oil
          const remainingKm = targetOdo - lastEntry.mileage;

          if (remainingKm <= 0) {
              // Reset cycle if target ODO is reached
              nextGearOil.innerHTML = `Next Change at: ${lastEntry.mileage + 6000} km<br>Remaining: 6000 km`;
              showToast('Gear Oil cycle reset!');
          } else {
              nextGearOil.innerHTML = `Next Change at: ${targetOdo} km<br>Remaining: ${remainingKm} km`;
          }
      } else {
          lastGearOil.textContent = 'No data';
          nextGearOil.textContent = 'No data';
      }
  }

  function updateHistory() {
      historyTableBody.innerHTML = ''; // Clear existing rows
      oilChangeLog.forEach(entry => {
          const row = document.createElement('tr');
          row.innerHTML = `
              <td>${entry.date}</td>
              <td>${entry.oilType === 'engine' ? 'Engine Oil' : 'Gear Oil'}</td>
              <td>${entry.mileage} km</td>
          `;
          historyTableBody.appendChild(row);
      });
  }

  function showToast(message) {
      toast.textContent = message;
      toast.classList.add('show');
      setTimeout(() => {
          toast.classList.remove('show');
      }, 3000); // Hide after 3 seconds
  }

  // Initialize the dashboard and history on page load
  updateDashboard();
  updateHistory();
});
