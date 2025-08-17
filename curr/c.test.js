import { describe, it, expect, beforeEach } from 'vitest';
import { getCurrencyCounts, renderCards, filterData, updateStats, currencyData } from './c.js';

beforeEach(() => {
  document.body.innerHTML = `
    <div id="currency-grid"></div>
    <input id="search-box" />
    <p id="total-countries"></p>
    <p id="unique-currencies"></p>
    <p id="most-used-currency"></p>
  `;
});

describe('getCurrencyCounts', () => {
  it('should correctly count the occurrences of each currency', () => {
    const testData = [
      { currencyName: 'USD' },
      { currencyName: 'EUR' },
      { currencyName: 'USD' },
      { currencyName: 'GBP' },
      { currencyName: 'EUR' },
      { currencyName: 'USD' },
    ];
    const result = getCurrencyCounts(testData);
    expect(result).toEqual([
      { name: 'USD', count: 3 },
      { name: 'EUR', count: 2 },
      { name: 'GBP', count: 1 },
    ]);
  });

  it('should return an empty array if the input data is empty', () => {
    const testData = [];
    const result = getCurrencyCounts(testData);
    expect(result).toEqual([]);
  });

  it('should handle data with a single currency', () => {
    const testData = [
      { currencyName: 'JPY' },
      { currencyName: 'JPY' },
      { currencyName: 'JPY' },
    ];
    const result = getCurrencyCounts(testData);
    expect(result).toEqual([{ name: 'JPY', count: 3 }]);
  });

  it('should correctly sort the currencies by count in descending order', () => {
    const testData = [
      { currencyName: 'CAD' },
      { currencyName: 'AUD' },
      { currencyName: 'CAD' },
      { currencyName: 'CHF' },
      { currencyName: 'AUD' },
      { currencyName: 'CAD' },
    ];
    const result = getCurrencyCounts(testData);
    expect(result[0]).toEqual({ name: 'CAD', count: 3 });
    expect(result[1]).toEqual({ name: 'AUD', count: 2 });
    expect(result[2]).toEqual({ name: 'CHF', count: 1 });
  });
});

describe('renderCards', () => {
  it('should render the correct number of currency cards', () => {
    const grid = document.getElementById('currency-grid');
    renderCards(currencyData, grid);
    expect(grid.children.length).toBe(currencyData.length);
  });

  it('should display a "no results" message when the data is empty', () => {
    const grid = document.getElementById('currency-grid');
    renderCards([], grid);
    expect(grid.innerHTML).toContain('No results found');
  });
});

describe('updateStats', () => {
  it('should correctly update the statistics', () => {
    updateStats(currencyData);
    expect(document.getElementById('total-countries').textContent).toBe(String(currencyData.length));
    const uniqueCurrencies = new Set(currencyData.map(c => c.currencyName));
    expect(document.getElementById('unique-currencies').textContent).toBe(String(uniqueCurrencies.size));
    expect(document.getElementById('most-used-currency').textContent).toBe('Euro');
  });
});

describe('filterData', () => {
  it('should filter the currency cards based on the search query', () => {
    const searchBox = document.getElementById('search-box');
    const grid = document.getElementById('currency-grid');

    // first render all cards
    renderCards(currencyData, grid);

    searchBox.value = 'Euro';
    filterData(searchBox, grid);

    const euroCountries = currencyData.filter(c => c.currencyName === 'Euro');
    expect(grid.children.length).toBe(euroCountries.length);
  });
});
