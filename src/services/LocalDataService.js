/**
 * LocalDataService - Loads data from separate JSON files organized by category
 *
 * Replaces the single treksData.json with organized category-based files:
 * - Forts: src/data/forts/
 * - Treks: src/data/treks/
 * - Waterfalls: src/data/waterfall/
 * - Caves: src/data/caves/
 */

// Import all fort data
import RajgadFort from '../data/forts/raigad.json';
import SinhagadFort from '../data/forts/singhagad.json';
import LohagadFort from '../data/forts/lohagad.json';
import TikonaFort from '../data/forts/tikona.json';
import TornaFort from '../data/forts/torna.json';
import VisapurFort from '../data/forts/visapur.json';
import HarishchandragadFort from '../data/forts/harishchandragad.json';
import LohagadData from '../data/forts/lohagad.json';
import PebFort from '../data/forts/peb.json';

// Import all trek data
import AndharbandTrek from '../data/treks/andharbhan.json';
import BhimashankarTrek from '../data/treks/bhimashankar.json';
import KalsubaiPeak from '../data/treks/kalsubai.json';
import RajmachiTrek from '../data/treks/rajmachi.json';

// Import all waterfall data
import BhimashankarWaterfall from '../data/waterfall/Bhimashankar_Waterfall.json';
import BhivpuriWaterfalls from '../data/waterfall/Bhivpuri_Waterfalls.json';

import KuneFalls from '../data/waterfall/Kune_Falls.json';
import LingmalaWaterfalls from '../data/waterfall/Lingmala_Waterfalls.json';

// Import all cave data
import BhajaCaves from '../data/caves/Bhaja_Caves.json';
import KarlaCaves from '../data/caves/Karla_Caves.json';

// Note: tikona.json and torna.json have been consolidated into the main data files

class LocalDataService {
  static allData = null;
  static dataByCategory = null;
  static initialized = false;

  /**
   * Initialize and combine all data from separate files
   */
  static initializeData() {
    if (this.initialized) {
      return this.allData;
    }

    try {
      // Combine all fort data
      const forts = [
        RajgadFort,
        SinhagadFort,
        LohagadFort,
        TikonaFort,
        TornaFort,
        VisapurFort,
        HarishchandragadFort,
        LohagadData,
        PebFort,
      ].filter(item => item && item.id); // Filter out any null/undefined items

      // Combine all trek data
      const treks = [
        AndharbandTrek,
        BhimashankarTrek,
        KalsubaiPeak,
        RajmachiTrek,
      ].filter(item => item && item.id);

      // Combine all waterfall data
      const waterfalls = [
        BhimashankarWaterfall,
        BhivpuriWaterfalls,
        KuneFalls,
        LingmalaWaterfalls,
      ].filter(item => item && item.id);

      // Combine all cave data
      const caves = [
        BhajaCaves,
        KarlaCaves,
      ].filter(item => item && item.id);

      // Ensure each item has the correct category
      forts.forEach(fort => {
        if (!fort.category) fort.category = 'fort';
      });

      treks.forEach(trek => {
        if (!trek.category) trek.category = 'trek';
      });

      waterfalls.forEach(waterfall => {
        if (!waterfall.category) waterfall.category = 'waterfall';
      });

      caves.forEach(cave => {
        if (!cave.category) cave.category = 'cave';
      });

      // Combine all data
      this.allData = [
        ...forts,
        ...treks,
        ...waterfalls,
        ...caves,
      ];

      // Create category-wise data
      this.dataByCategory = {
        fort: forts,
        trek: treks,
        waterfall: waterfalls,
        cave: caves,
      };

      this.initialized = true;

      console.log('LocalDataService initialized with:', {
        total: this.allData.length,
        forts: forts.length,
        treks: treks.length,
        waterfalls: waterfalls.length,
        caves: caves.length,
      });

      return this.allData;
    } catch (error) {
      console.error('Error initializing LocalDataService:', error);
      this.allData = [];
      this.dataByCategory = { fort: [], trek: [], waterfall: [], cave: [] };
      return this.allData;
    }
  }

  /**
   * Get all data combined
   */
  static getAllData() {
    if (!this.initialized) {
      this.initializeData();
    }
    return this.allData || [];
  }

  /**
   * Get data by category
   */
  static getDataByCategory(category) {
    if (!this.initialized) {
      this.initializeData();
    }
    return this.dataByCategory[category] || [];
  }

  /**
   * Get featured items across all categories
   */
  static getFeaturedData(limit = 10) {
    const allData = this.getAllData();
    return allData
      .filter(item => item.featured === true)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, limit);
  }

  /**
   * Get popular items (high rating) across all categories
   */
  static getPopularData(limit = 10) {
    const allData = this.getAllData();
    return allData
      .filter(item => item.rating && item.rating >= 4.0)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, limit);
  }

  /**
   * Get items by difficulty level
   */
  static getDataByDifficulty(difficulty) {
    const allData = this.getAllData();
    return allData.filter(item =>
      item.difficulty &&
      item.difficulty.toLowerCase().includes(difficulty.toLowerCase())
    );
  }

  /**
   * Search data by name or location
   */
  static searchData(query) {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const allData = this.getAllData();
    const searchTerm = query.toLowerCase().trim();

    return allData.filter(item =>
      (item.name && item.name.toLowerCase().includes(searchTerm)) ||
      (item.location && item.location.toLowerCase().includes(searchTerm)) ||
      (item.description && item.description.toLowerCase().includes(searchTerm))
    );
  }

  /**
   * Get item by ID
   */
  static getItemById(id) {
    const allData = this.getAllData();
    return allData.find(item => item.id === id || item.id === parseInt(id));
  }

  /**
   * Get items with coordinates (for map and nearby features)
   */
  static getItemsWithCoordinates() {
    const allData = this.getAllData();
    return allData.filter(item =>
      item.coordinates &&
      item.coordinates.latitude &&
      item.coordinates.longitude
    );
  }

  /**
   * Get data statistics
   */
  static getDataStats() {
    const allData = this.getAllData();
    const byCategory = this.dataByCategory || {};

    return {
      total: allData.length,
      byCategory: {
        forts: (byCategory.fort || []).length,
        treks: (byCategory.trek || []).length,
        waterfalls: (byCategory.waterfall || []).length,
        caves: (byCategory.cave || []).length,
      },
      featured: allData.filter(item => item.featured).length,
      withCoordinates: allData.filter(item =>
        item.coordinates && item.coordinates.latitude
      ).length,
      avgRating: allData.length > 0 ?
        allData.reduce((sum, item) => sum + (item.rating || 0), 0) / allData.length : 0,
    };
  }

  /**
   * Get random items for discovery
   */
  static getRandomData(limit = 5, category = null) {
    let data = category ? this.getDataByCategory(category) : this.getAllData();

    // Shuffle array and return limited results
    const shuffled = [...data].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, limit);
  }

  /**
   * Get items by location/district
   */
  static getDataByLocation(location) {
    const allData = this.getAllData();
    return allData.filter(item =>
      item.location &&
      item.location.toLowerCase().includes(location.toLowerCase())
    );
  }

  /**
   * Get top rated items by category
   */
  static getTopRatedByCategory(category, limit = 5) {
    const categoryData = this.getDataByCategory(category);
    return categoryData
      .filter(item => item.rating)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, limit);
  }

  /**
   * Get items suitable for beginners
   */
  static getBeginnerFriendlyData(limit = 10) {
    const allData = this.getAllData();
    return allData
      .filter(item =>
        item.difficulty &&
        (item.difficulty.toLowerCase().includes('easy') ||
         item.difficulty.toLowerCase().includes('beginner'))
      )
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, limit);
  }
}

export default LocalDataService;
