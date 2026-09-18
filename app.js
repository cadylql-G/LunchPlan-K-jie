/* =========================================================
   LUNCH PLAN — app.js  (v2)
   Features:
    - TheMealDB API integration (real photos + recipes)
    - Hierarchical category accordion (Step 1)
    - Day-swap mode (Step 3)
    - Copy-to-clipboard shopping list (Step 4)
   ========================================================= */

'use strict';

// ============================================================
// CONSTANTS
// ============================================================
const MEALDB_BASE = 'https://www.themealdb.com/api/json/v1/1';

// Allergen detection keywords (English — for TheMealDB ingredients)
const ALLERGEN_KEYWORDS_EN = {
  gluten:  ['flour','bread','pasta','wheat','barley','noodle','soy sauce','semolina','baguette',
             'bagel','toast','croissant','pastry','couscous','rye','breadcrumb','pita','tortilla','cracker'],
  dairy:   ['milk','cheese','butter','cream','yogurt','parmesan','mozzarella','feta','brie',
             'ricotta','ghee','cheddar','mascarpone','gouda','gruyere','halloumi','whey'],
  egg:     ['egg','yolk','mayonnaise','mayo','meringue'],
  seafood: ['fish','shrimp','prawn','lobster','crab','salmon','tuna','cod','seafood','anchovy',
             'clam','oyster','scallop','squid','octopus','tilapia','halibut','mackerel','sardine'],
  beef:    ['beef','steak','veal','ground beef','brisket','sirloin','ribeye','chuck'],
  nut:     ['peanut','almond','walnut','cashew','pecan','hazelnut','pistachio','macadamia','pine nut',
             'nut','tahini','sesame'],
  soy:     ['soy','tofu','miso','edamame','tamari','tempeh','soya'],
  pork:    ['pork','bacon','ham','prosciutto','pancetta','lard','sausage','salami','chorizo',
             'pepperoni','mortadella','guanciale']
};

// ============================================================
// LOCAL RECIPES
// ============================================================
const LOCAL_RECIPES = [
  // ─── SANDWICHES ───
  {
    id:'loc_blt', name:'BLT Bagel', nameZh:'BLT 培根生菜番茄贝果',
    catId:'sandwich', emoji:'🥯', time:'10 min', calories:480,
    ingredients:[{name:'贝果面包',amount:'1个'},{name:'培根',amount:'3片'},
                 {name:'生菜',amount:'适量'},{name:'番茄',amount:'2片'},{name:'蛋黄酱',amount:'1勺'}],
    allergens:['gluten','egg'], source:'local'
  },
  {
    id:'loc_tuna', name:'Tuna Sandwich', nameZh:'金枪鱼三明治',
    catId:'sandwich', emoji:'🥪', time:'8 min', calories:390,
    ingredients:[{name:'吐司',amount:'2片'},{name:'金枪鱼罐头',amount:'1罐'},
                 {name:'洋葱',amount:'1/4个'},{name:'芹菜',amount:'1根'},{name:'蛋黄酱',amount:'2勺'}],
    allergens:['seafood','egg','gluten'], source:'local'
  },
  {
    id:'loc_ham', name:'Ham & Cheese', nameZh:'火腿芝士三明治',
    catId:'sandwich', emoji:'🧀', time:'8 min', calories:430,
    ingredients:[{name:'法棍',amount:'半根'},{name:'火腿片',amount:'3片'},
                 {name:'车达芝士',amount:'2片'},{name:'芥末酱',amount:'适量'},{name:'生菜',amount:'适量'}],
    allergens:['gluten','dairy'], source:'local'
  },
  {
    id:'loc_avo', name:'Avocado Egg Toast', nameZh:'牛油果鸡蛋厚吐司',
    catId:'sandwich', emoji:'🥑', time:'12 min', calories:420,
    ingredients:[{name:'厚切吐司',amount:'2片'},{name:'牛油果',amount:'1个'},
                 {name:'鸡蛋',amount:'2个'},{name:'红辣椒片',amount:'少许'},{name:'柠檬汁',amount:'少许'}],
    allergens:['gluten','egg'], source:'local'
  },
  {
    id:'loc_club', name:'Club Sandwich', nameZh:'总汇三明治',
    catId:'sandwich', emoji:'🥪', time:'15 min', calories:550,
    ingredients:[{name:'三层吐司',amount:'3片'},{name:'鸡胸肉',amount:'100g'},
                 {name:'培根',amount:'3片'},{name:'番茄',amount:'2片'},
                 {name:'生菜',amount:'适量'},{name:'蛋黄酱',amount:'2勺'}],
    allergens:['gluten','egg'], source:'local'
  },
  {
    id:'loc_cap', name:'Caprese Panini', nameZh:'卡普雷塞帕尼尼',
    catId:'sandwich', emoji:'🥪', image: 'https://images.unsplash.com/photo-1528736235302-52922df5c122?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', time:'15 min', calories:460,
    ingredients:[{name:'恰巴塔面包',amount:'1个'},{name:'马苏里拉',amount:'100g'},
                 {name:'番茄',amount:'3片'},{name:'罗勒叶',amount:'适量'},{name:'橄榄油',amount:'2勺'}],
    allergens:['gluten','dairy'], source:'local'
  },

  // ─── CHINESE BENTO ───
  {
    id:'loc_beef_rice', name:'Japanese Beef Rice', nameZh:'日式肥牛饭',
    catId:'chinese', emoji:'🍚', time:'20 min', calories:580,
    ingredients:[{name:'肥牛片',amount:'200g'},{name:'米饭',amount:'1碗'},
                 {name:'洋葱',amount:'半个'},{name:'酱油',amount:'3勺'},{name:'味醂',amount:'2勺'}],
    allergens:['beef','soy','gluten'], source:'local'
  },
  {
    id:'loc_mapo', name:'Mapo Tofu', nameZh:'麻婆豆腐饭',
    catId:'chinese', emoji:'🫕', time:'20 min', calories:490,
    ingredients:[{name:'豆腐',amount:'300g'},{name:'猪肉末',amount:'100g'},
                 {name:'米饭',amount:'1碗'},{name:'豆瓣酱',amount:'2勺'},{name:'花椒',amount:'少许'}],
    allergens:['soy','gluten'], source:'local'
  },
  {
    id:'loc_charsiu', name:'Char Siu Rice', nameZh:'叉烧饭',
    catId:'chinese', emoji:'🍖', time:'15 min', calories:560,
    ingredients:[{name:'叉烧肉',amount:'150g'},{name:'米饭',amount:'1碗'},
                 {name:'菜心',amount:'100g'},{name:'蚝油',amount:'1勺'},{name:'生抽',amount:'2勺'}],
    allergens:['soy','gluten'], source:'local'
  },
  {
    id:'loc_kungpao', name:'Kung Pao Chicken', nameZh:'宫保鸡丁便当',
    catId:'chinese', emoji:'🌶️', time:'25 min', calories:520,
    ingredients:[{name:'鸡胸肉',amount:'200g'},{name:'花生',amount:'50g'},
                 {name:'干辣椒',amount:'适量'},{name:'米饭',amount:'1碗'},{name:'花椒',amount:'少许'}],
    allergens:['nut','soy','gluten'], source:'local'
  },
  {
    id:'loc_lurou', name:'Lu Rou Fan', nameZh:'台式卤肉饭',
    catId:'chinese', emoji:'🐷', time:'90 min', calories:620,
    ingredients:[{name:'猪五花',amount:'300g'},{name:'米饭',amount:'1碗'},
                 {name:'卤蛋',amount:'1个'},{name:'生抽',amount:'3勺'},{name:'冰糖',amount:'适量'}],
    allergens:['egg','soy','gluten'], source:'local'
  },

  // ─── SALADS ───
  {
    id:'loc_caesar', name:'Chicken Caesar', nameZh:'鸡胸肉凯撒沙拉 / Chicken Caesar',
    catId:'salad', emoji:'🥗', image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', time:'15 min', calories:380,
    ingredients:[{name:'鸡胸肉',amount:'150g'},{name:'罗马生菜',amount:'200g'},
                 {name:'帕玛森芝士',amount:'30g'},{name:'凯撒酱',amount:'3勺'},{name:'面包丁',amount:'适量'}],
    allergens:['dairy','egg','gluten'], source:'local'
  },
  {
    id:'loc_greek', name:'Greek Salad', nameZh:'希腊沙拉 / Greek Salad',
    catId:'salad', emoji:'🫒', image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', time:'10 min', calories:280,
    ingredients:[{name:'番茄',amount:'2个'},{name:'黄瓜',amount:'1根'},
                 {name:'红洋葱',amount:'半个'},{name:'橄榄',amount:'50g'},{name:'菲达奶酪',amount:'80g'}],
    allergens:['dairy'], source:'local'
  },
  {
    id:'loc_nicoise', name:'Tuna Niçoise', nameZh:'尼斯金枪鱼沙拉 / Tuna Niçoise',
    catId:'salad', emoji:'🐟', image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', time:'20 min', calories:350,
    ingredients:[{name:'金枪鱼罐头',amount:'1罐'},{name:'水煮蛋',amount:'2个'},
                 {name:'青豆',amount:'100g'},{name:'番茄',amount:'2个'},{name:'黑橄榄',amount:'50g'}],
    allergens:['seafood','egg'], source:'local'
  },
  {
    id:'loc_quinoa', name:'Quinoa Bowl', nameZh:'藜麦蔬菜碗 / Quinoa Bowl',
    catId:'salad', emoji:'🌾', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', time:'20 min', calories:320,
    ingredients:[{name:'藜麦',amount:'80g'},{name:'烤红椒',amount:'1个'},
                 {name:'黑豆',amount:'100g'},{name:'牛油果',amount:'半个'},{name:'青柠汁',amount:'2勺'}],
    allergens:[], source:'local'
  },
  {
    id:'loc_mango_shrimp', name:'Mango Shrimp Salad', nameZh:'芒果虾仁沙拉 / Mango Shrimp Salad',
    catId:'salad', emoji:'🥭', image: 'https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', time:'15 min', calories:290,
    ingredients:[{name:'虾仁',amount:'150g'},{name:'芒果',amount:'1个'},
                 {name:'混合生菜',amount:'100g'},{name:'红洋葱',amount:'适量'},{name:'青柠汁',amount:'2勺'}],
    allergens:['seafood'], source:'local'
  },

  // ─── FRENCH ───
  {
    id:'loc_bisque', name:'Tomato Bisque & Baguette', nameZh:'番茄浓汤 配法棍 / Tomato Bisque',
    catId:'french', emoji:'🥣', image:'https://images.unsplash.com/photo-1548943487-a2e4d43b4850?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', time:'25 min', calories:380,
    ingredients:[{name:'番茄',amount:'3个'},{name:'淡奶油',amount:'50ml'},{name:'法棍',amount:'半根'}],
    allergens:['dairy','gluten'], source:'local'
  },

  // ─── ITALIAN ───
  {
    id:'loc_bolog', name:'Spaghetti Bolognese', nameZh:'意大利肉酱意面',
    catId:'italian', emoji:'🍝', time:'35 min', calories:580,
    ingredients:[{name:'意面',amount:'100g'},{name:'牛肉末',amount:'150g'},
                 {name:'番茄罐头',amount:'1罐'},{name:'洋葱',amount:'半个'},{name:'帕玛森芝士',amount:'30g'}],
    allergens:['gluten','dairy','beef'], source:'local'
  },
  {
    id:'loc_carb', name:'Spaghetti Carbonara', nameZh:'卡邦尼培根蛋黄意面',
    catId:'italian', emoji:'🥚', time:'20 min', calories:620,
    ingredients:[{name:'意面',amount:'100g'},{name:'培根',amount:'80g'},
                 {name:'蛋黄',amount:'3个'},{name:'帕玛森芝士',amount:'50g'},{name:'黑胡椒',amount:'适量'}],
    allergens:['gluten','egg','dairy'], source:'local'
  },
  {
    id:'loc_pesto', name:'Pesto Pasta', nameZh:'罗勒青酱意面',
    catId:'italian', emoji:'🌿', time:'15 min', calories:490,
    ingredients:[{name:'螺旋意面',amount:'100g'},{name:'罗勒香蒜酱',amount:'3勺'},
                 {name:'樱桃番茄',amount:'100g'},{name:'帕玛森芝士',amount:'30g'},{name:'松子',amount:'20g'}],
    allergens:['gluten','dairy','nut'], source:'local'
  },
  {
    id:'loc_arr', name:'Penne Arrabbiata', nameZh:'辣番茄管面',
    catId:'italian', emoji:'🌶️', time:'25 min', calories:440,
    ingredients:[{name:'管面',amount:'100g'},{name:'番茄罐头',amount:'1罐'},
                 {name:'大蒜',amount:'3瓣'},{name:'干辣椒',amount:'适量'},{name:'橄榄油',amount:'3勺'}],
    allergens:['gluten'], source:'local'
  },
  {
    id:'loc_scampi', name:'Shrimp Scampi', nameZh:'蒜香虾仁意面',
    catId:'italian', emoji:'🍤', time:'20 min', calories:520,
    ingredients:[{name:'意面',amount:'100g'},{name:'大虾',amount:'150g'},
                 {name:'大蒜',amount:'4瓣'},{name:'白葡萄酒',amount:'50ml'},{name:'黄油',amount:'30g'}],
    allergens:['seafood','gluten','dairy'], source:'local'
  },
  // ─── AMERICAN ───
  {
    id:'loc_fries', name:'French Fries', nameZh:'炸薯条',
    catId:'american', emoji:'🍟', time:'20 min', calories:360,
    ingredients:[{name:'马铃薯',amount:'2个'},{name:'盐',amount:'少许'},{name:'植物油',amount:'适量'}],
    allergens:[], source:'local'
  },
  {
    id:'loc_nuggets', name:'Chicken Nuggets', nameZh:'炸鸡块',
    catId:'american', emoji:'🍗', time:'25 min', calories:410,
    ingredients:[{name:'鸡胸肉',amount:'200g'},{name:'面粉',amount:'50g'},{name:'面包糠',amount:'50g'},{name:'鸡蛋',amount:'1个'}],
    allergens:['gluten','egg'], source:'local'
  },
];

// ============================================================
// BIG CATEGORIES CONFIG
// ============================================================
const BIG_CATEGORIES = [
  {
    id: 'sandwich',
    icon: '🥪',
    nameZh: '三明治 & 贝果',
    desc: 'BLT · 金枪鱼 · 火腿芝士 · 牛油果吐司',
    gradient: 'linear-gradient(135deg,#f97316,#ea580c)',
    source: 'local',
  },
  {
    id: 'chinese',
    icon: '🥟',
    nameZh: '中式面点',
    desc: '叉烧饭 · 宫保鸡丁 · 卤肉饭 · 麻婆豆腐',
    gradient: 'linear-gradient(135deg,#ef4444,#dc2626)',
    source: 'local',
  },
  {
    id: 'french',
    icon: '🥐',
    nameZh: '法式料理',
    desc: '番茄浓汤 · 法式炖菜 · 尼斯沙拉 · 可颂',
    gradient: 'linear-gradient(135deg,#8b5cf6,#7c3aed)',
    source: 'area',
    area: 'French',
  },
  {
    id: 'american',
    icon: '🍔',
    nameZh: '美式快餐',
    desc: '汉堡 · 烤鸡 · BBQ 肋排 · 炸鱼',
    gradient: 'linear-gradient(135deg,#eab308,#ca8a04)',
    source: 'area',
    area: 'American',
  },
  {
    id: 'salad',
    icon: '🥗',
    nameZh: '冷餐 & 沙拉',
    desc: '凯撒 · 谷物碗 · 芒果虾仁 · 希腊沙拉',
    gradient: 'linear-gradient(135deg,#14b8a6,#0d9488)',
    source: 'local',
  },
  {
    id: 'italian',
    icon: '🍝',
    nameZh: '意式料理',
    desc: '肉酱面 · 卡邦尼 · 青酱 · 蒜香虾',
    gradient: 'linear-gradient(135deg,#ec4899,#db2777)',
    source: 'local',
  },
];

// Allergen DB
const ALLERGENS = [
  { id:'gluten',  icon:'🌾', label:'麸质 / 小麦' },
  { id:'dairy',   icon:'🥛', label:'乳制品' },
  { id:'egg',     icon:'🥚', label:'鸡蛋' },
  { id:'seafood', icon:'🦐', label:'海鲜' },
  { id:'beef',    icon:'🥩', label:'牛肉' },
  { id:'nut',     icon:'🥜', label:'坚果' },
  { id:'soy',     icon:'🫘', label:'大豆 / 酱油' },
  { id:'pork',    icon:'🐷', label:'猪肉' },
];

// Days
const DAYS = [
  { key:'mon', label:'周一' },
  { key:'tue', label:'周二' },
  { key:'wed', label:'周三' },
  { key:'thu', label:'周四' },
  { key:'fri', label:'周五' },
];

// ============================================================
// APP STATE
// ============================================================
const state = {
  currentStep: 1,
  selectedMeals: new Map(),      // id → meal object
  selectedAllergens: new Set(),
  weekPlan: [],                  // [meal, meal, meal, meal, meal]
  shoppingChecked: new Set(),

  swapSourceIdx: null,           // Step 3 swap mode

  expandedCategories: new Set(),
  categoryMeals: new Map(),      // catId → meal[]
};

// Cache full TheMealDB detail responses
const detailCache = new Map(); // mealdbId → full detail object

// ============================================================
// DOM HELPERS
// ============================================================
const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

function showStep(n) {
  $$('.step-section').forEach(s => s.classList.remove('active'));
  $(`#step${n}`).classList.add('active');
  state.currentStep = n;
  $$('.step-btn').forEach(btn => {
    const step = parseInt(btn.dataset.step, 10);
    btn.classList.toggle('active', step === n);
    if (step <= n) btn.disabled = false;
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showToast(msg, duration = 2500) {
  const toast = $('#toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), duration);
}

// ============================================================
// THEMEALDDB API
// ============================================================
async function fetchCategoryMeals(cat) {
  if (state.categoryMeals.has(cat.id)) return state.categoryMeals.get(cat.id);

  if (cat.source === 'local') {
    const meals = LOCAL_RECIPES.filter(r => r.catId === cat.id);
    state.categoryMeals.set(cat.id, meals);
    return meals;
  }

  // API fetch
  const url = `${MEALDB_BASE}/filter.php?a=${encodeURIComponent(cat.area)}`;
  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    let meals = (data.meals || []).slice(0, 24).map(m => normalizeApiMeal(m, cat.id));
    
    // Add local fallback meals if they exist
    const localMeals = LOCAL_RECIPES.filter(r => r.catId === cat.id);
    if (localMeals.length > 0) {
      meals = [...meals, ...localMeals];
    }
    
    state.categoryMeals.set(cat.id, meals);
    return meals;
  } catch (err) {
    console.warn('TheMealDB fetch failed:', err);
    // Fallback to local
    const fallbackMeals = LOCAL_RECIPES.filter(r => r.catId === cat.id);
    state.categoryMeals.set(cat.id, fallbackMeals);
    return fallbackMeals;
  }
}

function normalizeApiMeal(m, catId) {
  return {
    id: `api_${m.idMeal}`,
    source: 'api',
    mealdbId: m.idMeal,
    name: m.strMeal,
    nameZh: m.strMeal,
    image: m.strMealThumb,
    catId,
    time: '~30 min',
    calories: null,
    ingredients: [],
    allergens: [],
    detailsFetched: false,
  };
}

async function fetchMealDetail(meal) {
  if (meal.source === 'local' || meal.detailsFetched) return meal;

  let rawDetail = detailCache.get(meal.mealdbId);
  if (!rawDetail) {
    try {
      const resp = await fetch(`${MEALDB_BASE}/lookup.php?i=${meal.mealdbId}`);
      const data = await resp.json();
      rawDetail = data.meals?.[0];
      if (rawDetail) detailCache.set(meal.mealdbId, rawDetail);
    } catch (err) {
      console.warn('Detail fetch failed:', err);
      return meal;
    }
  }
  if (!rawDetail) return meal;

  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const name = (rawDetail[`strIngredient${i}`] || '').trim();
    const amount = (rawDetail[`strMeasure${i}`] || '').trim();
    if (name) ingredients.push({ name, amount });
  }

  const allergens = detectAllergensEn(ingredients.map(i => i.name));

  const updated = {
    ...meal,
    ingredients,
    allergens,
    instructions: rawDetail.strInstructions || '',
    detailsFetched: true,
  };

  // Refresh in selectedMeals if present
  if (state.selectedMeals.has(meal.id)) {
    state.selectedMeals.set(meal.id, updated);
  }

  // Also update in categoryMeals cache
  const catMeals = state.categoryMeals.get(meal.catId);
  if (catMeals) {
    const idx = catMeals.findIndex(m => m.id === meal.id);
    if (idx !== -1) catMeals[idx] = updated;
  }

  return updated;
}

function detectAllergensEn(ingredientNames) {
  const detected = new Set();
  const lower = ingredientNames.map(n => n.toLowerCase());
  for (const [allergenId, keywords] of Object.entries(ALLERGEN_KEYWORDS_EN)) {
    if (keywords.some(k => lower.some(i => i.includes(k)))) {
      detected.add(allergenId);
    }
  }
  return [...detected];
}

// ============================================================
// STEP 1 — CATEGORY ACCORDION
// ============================================================
function buildCategoryAccordion() {
  const container = $('#categoryAccordion');
  container.innerHTML = '';

  BIG_CATEGORIES.forEach(cat => {
    const section = document.createElement('div');
    section.className = 'cat-section';
    section.dataset.catId = cat.id;

    section.innerHTML = `
      <div class="cat-header" id="catHeader_${cat.id}">
        <div class="cat-header-left">
          <div class="cat-icon-wrap" style="background:${cat.gradient}">${cat.icon}</div>
          <div class="cat-info">
            <span class="cat-name">${cat.nameZh}</span>
            <span class="cat-desc">${cat.desc}</span>
          </div>
        </div>
        <div class="cat-header-right">
          <span class="cat-count-badge" id="catCount_${cat.id}"></span>
          <span class="cat-selected-badge" id="catSelBadge_${cat.id}" style="display:none"></span>
          <span class="cat-arrow" id="catArrow_${cat.id}">›</span>
        </div>
      </div>
      <div class="cat-body" id="catBody_${cat.id}" style="display:none">
        <div class="cat-add-custom">
          <input type="text" id="customInput_${cat.id}" placeholder="输入自定义菜名 (如：洋葱圈)" class="custom-dish-input" />
          <button class="btn-ghost custom-dish-btn" data-cat-id="${cat.id}">添加</button>
        </div>
        <div class="cat-meal-grid" id="catGrid_${cat.id}">
          <div class="loading-spinner">
            <div class="spinner"></div>
            <span>正在加载菜谱...</span>
          </div>
        </div>
      </div>
    `;

    section.querySelector('.cat-header').addEventListener('click', () => toggleCategory(cat));
    section.querySelector('.custom-dish-btn').addEventListener('click', (e) => handleAddCustomDish(cat.id, e));
    container.appendChild(section);
  });
}

function handleAddCustomDish(catId, e) {
  const input = $(`#customInput_${catId}`);
  const name = input.value.trim();
  if (!name) return;
  
  const id = 'custom_' + Date.now();
  const meal = {
    id,
    name: name,
    nameZh: name,
    catId: catId,
    emoji: '🍽️',
    time: '15 min',
    calories: null,
    ingredients: [{name: name, amount: '适量'}],
    allergens: [],
    source: 'local'
  };
  
  LOCAL_RECIPES.push(meal);
  
  let meals = state.categoryMeals.get(catId) || [];
  meals.unshift(meal);
  state.categoryMeals.set(catId, meals);
  
  // Select it automatically
  state.selectedMeals.set(id, meal);
  
  renderCategoryMeals(catId, meals);
  updateSelectionUI();
  updateCategorySelectionBadge(catId);
  
  input.value = '';
  showToast(`✅ 已添加自定义菜品：${name}`);
}

async function toggleCategory(cat) {
  const body = $(`#catBody_${cat.id}`);
  const arrow = $(`#catArrow_${cat.id}`);
  const section = document.querySelector(`.cat-section[data-cat-id="${cat.id}"]`);

  if (state.expandedCategories.has(cat.id)) {
    body.style.display = 'none';
    arrow.style.transform = '';
    section.classList.remove('expanded');
    state.expandedCategories.delete(cat.id);
  } else {
    body.style.display = 'block';
    arrow.style.transform = 'rotate(90deg)';
    section.classList.add('expanded');
    state.expandedCategories.add(cat.id);

    if (!state.categoryMeals.has(cat.id)) {
      // Show loading, fetch, then render
      const meals = await fetchCategoryMeals(cat);
      renderCategoryMeals(cat.id, meals);
    } else {
      renderCategoryMeals(cat.id, state.categoryMeals.get(cat.id));
    }
  }
}

function renderCategoryMeals(catId, meals) {
  const grid = $(`#catGrid_${catId}`);
  const countBadge = $(`#catCount_${catId}`);

  if (!meals || meals.length === 0) {
    grid.innerHTML = '<div class="no-meals">😔 暂无菜谱数据，请检查网络连接</div>';
    countBadge.textContent = '0 道';
    return;
  }

  countBadge.textContent = `${meals.length} 道`;
  grid.innerHTML = '';

  meals.forEach(meal => {
    const card = createMealCard(meal, state.selectedMeals.has(meal.id));
    grid.appendChild(card);
  });
}

function createMealCard(meal, isSelected) {
  const card = document.createElement('div');
  card.className = `meal-card${isSelected ? ' selected' : ''}`;
  card.dataset.mealId = meal.id;
  card.draggable = true;

  const imgContent = meal.image
    ? `<img src="${meal.image}" alt="${meal.name}" loading="lazy"
        onerror="this.outerHTML='<div class=card-emoji-fallback>${meal.emoji || '🍽️'}</div>'" />`
    : `<div class="card-emoji-fallback">${meal.emoji || '🍽️'}</div>`;

  const metaText = meal.source === 'local'
    ? `⏱ ${meal.time} · 🔥 ${meal.calories} kcal`
    : `⏱ ${meal.time}`;

  card.innerHTML = `
    <div class="meal-card-img">
      ${imgContent}
      <div class="meal-select-ring"></div>
      <div class="meal-check-badge">✓</div>
      <div class="meal-card-actions" onclick="event.stopPropagation()">
        <button class="meal-action-btn btn-delete" title="删除 / Delete">🗑️</button>
        <button class="meal-action-btn btn-up" title="上移 / Move Up">▲</button>
        <button class="meal-action-btn btn-down" title="下移 / Move Down">▼</button>
      </div>
    </div>
    <div class="meal-card-body">
      <div class="meal-card-name">${meal.nameZh || meal.name}</div>
      <div class="meal-card-meta">${metaText}</div>
    </div>
  `;

  card.addEventListener('click', () => handleMealCardClick(meal, card));
  
  card.querySelector('.btn-delete').addEventListener('click', (e) => {
    e.stopPropagation();
    deleteMeal(meal.id, meal.catId);
  });
  card.querySelector('.btn-up').addEventListener('click', (e) => {
    e.stopPropagation();
    moveMeal(meal.id, meal.catId, -1);
  });
  card.querySelector('.btn-down').addEventListener('click', (e) => {
    e.stopPropagation();
    moveMeal(meal.id, meal.catId, 1);
  });
  
  setupMealCardDnD(card, meal);

  return card;
}

function deleteMeal(mealId, catId) {
  let meals = state.categoryMeals.get(catId) || [];
  meals = meals.filter(m => m.id !== mealId);
  state.categoryMeals.set(catId, meals);
  
  if (state.selectedMeals.has(mealId)) {
    state.selectedMeals.delete(mealId);
    updateSelectionUI();
    updateCategorySelectionBadge(catId);
  }
  
  renderCategoryMeals(catId, meals);
  showToast('🗑️ 已删除该菜品 / Recipe deleted');
}

function moveMeal(mealId, catId, direction) {
  let meals = state.categoryMeals.get(catId) || [];
  const idx = meals.findIndex(m => m.id === mealId);
  if (idx < 0) return;
  const newIdx = idx + direction;
  if (newIdx < 0 || newIdx >= meals.length) return;
  
  const temp = meals[idx];
  meals[idx] = meals[newIdx];
  meals[newIdx] = temp;
  
  renderCategoryMeals(catId, meals);
}

let draggedMeal = null;
function setupMealCardDnD(card, meal) {
  card.addEventListener('dragstart', (e) => {
    draggedMeal = { id: meal.id, catId: meal.catId };
    setTimeout(() => card.classList.add('dragging'), 0);
  });
  card.addEventListener('dragend', () => {
    draggedMeal = null;
    card.classList.remove('dragging');
    $$('.meal-card').forEach(c => c.classList.remove('drag-over'));
  });
  card.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (draggedMeal && draggedMeal.catId === meal.catId && draggedMeal.id !== meal.id) {
      card.classList.add('drag-over');
    }
  });
  card.addEventListener('dragleave', () => card.classList.remove('drag-over'));
  card.addEventListener('drop', (e) => {
    e.preventDefault();
    card.classList.remove('drag-over');
    if (draggedMeal && draggedMeal.catId === meal.catId && draggedMeal.id !== meal.id) {
      // Reorder array
      let meals = state.categoryMeals.get(meal.catId) || [];
      const fromIdx = meals.findIndex(m => m.id === draggedMeal.id);
      const toIdx = meals.findIndex(m => m.id === meal.id);
      
      const item = meals.splice(fromIdx, 1)[0];
      meals.splice(toIdx, 0, item);
      
      renderCategoryMeals(meal.catId, meals);
    }
  });
}

async function handleMealCardClick(meal, card) {
  const id = meal.id;

  if (state.selectedMeals.has(id)) {
    state.selectedMeals.delete(id);
    card.classList.remove('selected');
    showToast(`➖ 已移除：${meal.nameZh || meal.name}`);
  } else {
    state.selectedMeals.set(id, meal);
    card.classList.add('selected');
    showToast(`✅ 已选择：${meal.nameZh || meal.name}`);

    // Fetch full detail in background for API meals
    if (meal.source === 'api' && !meal.detailsFetched) {
      fetchMealDetail(meal); // fire-and-forget
    }
  }

  updateSelectionUI();
  updateCategorySelectionBadge(meal.catId);
}

function updateCategorySelectionBadge(catId) {
  const badge = $(`#catSelBadge_${catId}`);
  if (!badge) return;
  const count = [...state.selectedMeals.values()].filter(m => m.catId === catId).length;
  if (count > 0) {
    badge.textContent = `已选 ${count}`;
    badge.style.display = 'inline-block';
  } else {
    badge.style.display = 'none';
  }
}

function updateSelectionUI() {
  const count = state.selectedMeals.size;
  $('#selectionCount').textContent = count;
  $('#step1Next').disabled = count < 1;
}

// ============================================================
// STEP 2 — ALLERGENS
// ============================================================
function buildAllergenGrid() {
  const grid = $('#allergenGrid');
  grid.innerHTML = '';

  ALLERGENS.forEach(al => {
    const chip = document.createElement('div');
    chip.className = `allergen-chip${state.selectedAllergens.has(al.id) ? ' selected' : ''}`;
    chip.innerHTML = `
      <span class="chip-icon">${al.icon}</span>
      <span class="chip-label">${al.label}</span>
      <span class="chip-check">✓</span>
    `;
    chip.addEventListener('click', () => {
      if (state.selectedAllergens.has(al.id)) {
        state.selectedAllergens.delete(al.id);
        chip.classList.remove('selected');
      } else {
        state.selectedAllergens.add(al.id);
        chip.classList.add('selected');
      }
      updateAllergenSummary();
    });
    grid.appendChild(chip);
  });

  updateAllergenSummary();
}

function mealPassesAllergenFilter(meal) {
  if (state.selectedAllergens.size === 0) return true;
  return !meal.allergens.some(a => state.selectedAllergens.has(a));
}

function updateAllergenSummary() {
  const selected = [...state.selectedMeals.values()];
  const passed = selected.filter(mealPassesAllergenFilter).length;
  const blocked = selected.length - passed;
  const summary = $('#allergenSummary');
  const text = summary.querySelector('.summary-text');

  if (state.selectedAllergens.size === 0) {
    text.textContent = `未选择忌口，所有已选 ${selected.length} 道食谱均可使用`;
    summary.style.background = 'var(--bg-glass)';
    summary.style.borderColor = 'var(--border-subtle)';
  } else {
    const names = [...state.selectedAllergens]
      .map(id => ALLERGENS.find(a => a.id === id)?.label)
      .filter(Boolean).join('、');

    text.innerHTML = `🚫 已过滤含 <strong>${names}</strong> 的食谱 ${blocked} 道 · 系统将从符合条件的全部菜库中补充`;

    if (passed < 5) {
      summary.style.background = 'rgba(244,63,94,0.08)';
      summary.style.borderColor = 'rgba(244,63,94,0.3)';
      text.innerHTML += `<br><small style="color:var(--accent-rose)">⚠️ 可用食谱不足5道，系统将从所有已加载分类中补充</small>`;
    } else {
      summary.style.background = 'rgba(20,184,166,0.08)';
      summary.style.borderColor = 'rgba(20,184,166,0.3)';
    }
  }
}

function getAllLoadedMeals() {
  const all = [];
  for (const meals of state.categoryMeals.values()) all.push(...meals);
  return all;
}

// ============================================================
// STEP 3 — WEEK PLAN GENERATION
// ============================================================
function generateWeekPlan() {
  // Preferred: selected meals passing filter
  const preferred = [...state.selectedMeals.values()].filter(mealPassesAllergenFilter);

  // Fallback pool: all loaded meals passing filter
  const allMeals = getAllLoadedMeals().filter(mealPassesAllergenFilter);
  const extras = allMeals.filter(m => !state.selectedMeals.has(m.id));

  const pool = shuffle([...preferred, ...extras]);
  const plan = [];
  const usedIds = new Set();

  for (let i = 0; i < 5; i++) {
    let pick = pool.find(m => !usedIds.has(m.id));
    if (!pick) pick = pool[i % Math.max(pool.length, 1)];
    plan.push(pick || null);
    if (pick) usedIds.add(pick.id);
  }

  state.weekPlan = plan;
}

function renderWeekPlan() {
  const grid = $('#weekGrid');
  grid.innerHTML = '';
  const monday = getMonday();

  DAYS.forEach((day, idx) => {
    const meal = state.weekPlan[idx];
    if (!meal) return;
    const date = new Date(monday);
    date.setDate(monday.getDate() + idx);
    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
    const card = buildDayCard(day, dateStr, meal, idx);
    grid.appendChild(card);
  });
}

function buildDayCard(day, dateStr, meal, idx) {
  const card = document.createElement('div');
  card.className = 'day-card';
  card.dataset.dayIdx = idx;
  card.draggable = true;

  // Image
  let imgInner;
  if (meal.image) {
    imgInner = `<img src="${meal.image}" alt="${meal.name}" loading="lazy"
      style="width:100%;height:100%;object-fit:cover;"
      onerror="this.outerHTML='<div style=font-size:4rem;display:flex;align-items:center;justify-content:center;height:100%>${meal.emoji || '🍽️'}</div>'" />`;
  } else {
    imgInner = `<div style="font-size:4rem;display:flex;align-items:center;justify-content:center;height:100%">${meal.emoji || '🍽️'}</div>`;
  }

  const ingList = meal.ingredients.length
    ? meal.ingredients.slice(0, 4).map(i => i.name || i).join('、') + (meal.ingredients.length > 4 ? '…' : '')
    : '（点击换一个以查看食材 / Replace to see info）';

  card.innerHTML = `
    <div class="day-header" style="cursor: grab;">
      <span class="day-label">${day.label}</span>
      <span class="day-date">${dateStr}</span>
    </div>
    <div class="day-recipe-img" id="dayImg_${idx}">${imgInner}</div>
    <div class="day-body">
      <div class="day-recipe-name">${meal.nameZh || meal.name}</div>
      <div class="day-ingredients">🧂 ${ingList}</div>
      <div class="day-meta">⏱ ${meal.time}${meal.calories ? ` · 🔥 ${meal.calories} kcal` : ''}</div>
      <button class="btn-swap">👎 换一个 (No)</button>
    </div>
  `;

  // Replace with random meal
  card.querySelector('.btn-swap').addEventListener('click', e => {
    e.stopPropagation();
    replaceRandomMeal(idx);
  });
  
  setupDayCardDnD(card, idx);

  return card;
}

// ─── Swap mode logic ───
let draggedDayIdx = null;
function setupDayCardDnD(card, idx) {
  card.addEventListener('dragstart', (e) => {
    draggedDayIdx = idx;
    setTimeout(() => card.classList.add('dragging'), 0);
  });
  card.addEventListener('dragend', () => {
    draggedDayIdx = null;
    card.classList.remove('dragging');
    $$('.day-card').forEach(c => c.classList.remove('drag-over'));
  });
  card.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (draggedDayIdx !== null && draggedDayIdx !== idx) {
      card.classList.add('drag-over');
    }
  });
  card.addEventListener('dragleave', () => card.classList.remove('drag-over'));
  card.addEventListener('drop', (e) => {
    e.preventDefault();
    card.classList.remove('drag-over');
    if (draggedDayIdx !== null && draggedDayIdx !== idx) {
      performSwap(draggedDayIdx, idx);
    }
  });
}

function performSwap(idxA, idxB) {
  // Swap in plan array
  const tmp = state.weekPlan[idxA];
  state.weekPlan[idxA] = state.weekPlan[idxB];
  state.weekPlan[idxB] = tmp;

  renderWeekPlan();
  showToast(`✅ ${DAYS[idxA].label} ↔ ${DAYS[idxB].label} 交换成功！/ Swapped!`);
}

function replaceRandomMeal(dayIdx) {
  const currentId = state.weekPlan[dayIdx]?.id;
  const otherIds = new Set(state.weekPlan.filter((_, i) => i !== dayIdx).map(m => m?.id));

  const pool = getAllLoadedMeals()
    .filter(m => mealPassesAllergenFilter(m) && m.id !== currentId && !otherIds.has(m.id));

  let pick;
  if (pool.length > 0) {
    pick = pool[Math.floor(Math.random() * pool.length)];
  } else {
    const fallback = getAllLoadedMeals().filter(m => mealPassesAllergenFilter(m) && m.id !== currentId);
    pick = fallback.length > 0 ? fallback[Math.floor(Math.random() * fallback.length)] : state.weekPlan[dayIdx];
  }

  state.weekPlan[dayIdx] = pick;

  // Animate & re-render this card
  const monday = getMonday();
  const date = new Date(monday);
  date.setDate(monday.getDate() + dayIdx);
  const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;

  const oldCard = $(`[data-day-idx="${dayIdx}"]`);
  if (oldCard) {
    const newCard = buildDayCard(DAYS[dayIdx], dateStr, pick, dayIdx);
    newCard.querySelector('.day-recipe-img').classList.add('animating');
    oldCard.parentNode.replaceChild(newCard, oldCard);
    setTimeout(() => newCard.querySelector('.day-recipe-img').classList.remove('animating'), 500);
  }

  showToast(`🔄 已换成：${pick.nameZh || pick.name}`);
}

function getMonday() {
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
  return monday;
}

// ============================================================
// STEP 4 — SHOPPING LIST
// ============================================================
const INGREDIENT_CAT_KEYWORDS = {
  '蛋白质 🥩': ['chicken','beef','pork','lamb','shrimp','prawn','fish','salmon','tuna','egg','bacon','ham',
                  '鸡','猪','牛','羊','虾','鱼','蛋','培根','火腿','叉烧','肥牛'],
  '蔬菜 & 香草 🥦': ['lettuce','tomato','onion','garlic','pepper','mushroom','spinach','cucumber','carrot',
                       'celery','basil','parsley','cilantro','rosemary','thyme','olive',
                       '生菜','番茄','洋葱','蒜','辣椒','菠菜','黄瓜','胡萝卜','芹菜','罗勒','橄榄','菜心','豆腐'],
  '主食 & 淀粉 🌾': ['pasta','rice','bread','flour','noodle','potato','quinoa','couscous','semolina',
                       '意面','管面','米饭','面包','吐司','法棍','贝果','藜麦'],
  '乳制品 & 蛋 🥛': ['cheese','milk','cream','butter','yogurt','egg',
                       '芝士','牛奶','奶油','黄油','鸡蛋','卤蛋','蛋黄'],
  '调味料 & 酱汁 🧂': ['sauce','oil','vinegar','salt','sugar','soy','mayo','mustard','wine','stock','broth',
                         '酱油','生抽','老抽','橄榄油','醋','盐','糖','蛋黄酱','芥末','豆瓣酱','蚝油','味醂'],
  '水果 & 坚果 🍋': ['lemon','lime','avocado','mango','strawberry','nut','pine','almond','walnut','peanut',
                       '牛油果','柠檬','芒果','草莓','核桃','花生','松子'],
};

function generateShoppingList() {
  const ingMap = new Map(); // name → { name, amounts:[], days:[] }

  state.weekPlan.forEach((meal, idx) => {
    if (!meal) return;
    const dayLabel = DAYS[idx].label;
    const ingredients = Array.isArray(meal.ingredients)
      ? meal.ingredients.map(i => (typeof i === 'string' ? { name: i, amount: '' } : i))
      : [];

    ingredients.forEach(ing => {
      const key = ing.name;
      if (!ingMap.has(key)) ingMap.set(key, { name: ing.name, amounts: [], days: [] });
      const entry = ingMap.get(key);
      if (ing.amount && !entry.amounts.includes(ing.amount)) entry.amounts.push(ing.amount);
      entry.days.push(dayLabel);
    });
  });

  // Group
  const groups = {};
  for (const [, item] of ingMap) {
    const cat = categorizeIngredient(item.name);
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(item);
  }

  renderShoppingList(groups);
  renderPlanSummary();
  updateShoppingProgress();
}

function categorizeIngredient(name) {
  const lower = name.toLowerCase();
  for (const [cat, keywords] of Object.entries(INGREDIENT_CAT_KEYWORDS)) {
    if (keywords.some(k => lower.includes(k.toLowerCase()))) return cat;
  }
  return '其他食材 🛒';
}

function renderShoppingList(groups) {
  const listEl = $('#shoppingList');
  listEl.innerHTML = '';

  const ORDER = [
    '蛋白质 🥩', '主食 & 淀粉 🌾', '蔬菜 & 香草 🥦',
    '乳制品 & 蛋 🥛', '调味料 & 酱汁 🧂', '水果 & 坚果 🍋', '其他食材 🛒'
  ];
  const allCats = [...new Set([...ORDER, ...Object.keys(groups)])];

  allCats.forEach(cat => {
    if (!groups[cat]?.length) return;

    const section = document.createElement('div');
    section.className = 'shopping-category-section';
    section.innerHTML = `<div class="shopping-category-title">${cat}</div>`;

    groups[cat].forEach(item => {
      const isChecked = state.shoppingChecked.has(item.name);
      const amountStr = item.amounts.length ? item.amounts.join(' / ') : `共 ${item.days.length} 天`;

      const div = document.createElement('div');
      div.className = `shopping-item${isChecked ? ' checked' : ''}`;
      div.dataset.item = item.name;
      div.innerHTML = `
        <div class="item-checkbox">${isChecked ? '✓' : ''}</div>
        <span class="item-label">${item.name}</span>
        <span class="item-amount">${amountStr}</span>
      `;
      div.addEventListener('click', () => toggleShoppingItem(item.name, div));
      section.appendChild(div);
    });

    listEl.appendChild(section);
  });

  $('#shoppingTotal').textContent = $$('.shopping-item').length;
}

function toggleShoppingItem(name, el) {
  if (state.shoppingChecked.has(name)) {
    state.shoppingChecked.delete(name);
    el.classList.remove('checked');
    el.querySelector('.item-checkbox').textContent = '';
  } else {
    state.shoppingChecked.add(name);
    el.classList.add('checked');
    el.querySelector('.item-checkbox').textContent = '✓';
  }
  updateShoppingProgress();
}

function updateShoppingProgress() {
  const total = $$('.shopping-item').length;
  const done = state.shoppingChecked.size;
  $('#shoppingDone').textContent = done;
  $('#shoppingTotal').textContent = total;
  $('#progressBarFill').style.width = total > 0 ? `${(done / total) * 100}%` : '0%';
  if (done === total && total > 0) showToast('🎉 太棒了！购物清单全部完成！');
}

function renderPlanSummary() {
  const list = $('#planSummaryList');
  list.innerHTML = '';
  state.weekPlan.forEach((meal, idx) => {
    if (!meal) return;
    const li = document.createElement('li');
    li.className = 'plan-summary-item';
    li.innerHTML = `
      <div class="plan-day-badge">${DAYS[idx].label}</div>
      <span>${meal.emoji || '🍽️'} ${meal.nameZh || meal.name}</span>
    `;
    list.appendChild(li);
  });
}

// ─── Copy shopping list to clipboard ───
async function copyShoppingList() {
  let lines = ['🛒 午餐购物清单', '─'.repeat(32), ''];

  $$('.shopping-category-section').forEach(section => {
    const title = section.querySelector('.shopping-category-title')?.textContent?.trim();
    if (title) lines.push(`\n${title}`);
    section.querySelectorAll('.shopping-item').forEach(item => {
      const name = item.querySelector('.item-label')?.textContent?.trim() || '';
      const amount = item.querySelector('.item-amount')?.textContent?.trim() || '';
      const done = item.classList.contains('checked') ? '✅' : '☐';
      lines.push(`  ${done} ${name}${amount ? '  ' + amount : ''}`);
    });
  });

  lines.push('', '─'.repeat(32));
  lines.push('📅 本周菜单：');
  state.weekPlan.forEach((meal, idx) => {
    if (meal) lines.push(`  ${DAYS[idx].label}：${meal.nameZh || meal.name}`);
  });
  lines.push('');
  lines.push('由 LunchPlan 生成 🍱');

  const text = lines.join('\n');

  try {
    await navigator.clipboard.writeText(text);
    showToast('📋 购物清单已复制到剪贴板！');
  } catch {
    // Fallback for older browsers
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus(); ta.select();
    try {
      document.execCommand('copy');
      showToast('📋 购物清单已复制！');
    } catch {
      showToast('❌ 复制失败，请手动选取文本');
    }
    document.body.removeChild(ta);
  }
}

// ============================================================
// NAVIGATION
// ============================================================
function initNavigation() {
  // Step 1 → 2
  $('#step1Next').addEventListener('click', async () => {
    // Fetch details for selected API meals before proceeding
    const apiMeals = [...state.selectedMeals.values()].filter(m => m.source === 'api' && !m.detailsFetched);
    if (apiMeals.length > 0) {
      showToast('⏳ 正在加载菜谱详情…');
      await Promise.all(apiMeals.map(fetchMealDetail));
    }
    showStep(2);
    buildAllergenGrid();
    $('#navStep2').disabled = false;
  });

  $('#step2Back').addEventListener('click', () => showStep(1));

  // Step 2 → 3
  $('#step2Next').addEventListener('click', () => {
    generateWeekPlan();
    renderWeekPlan();
    showStep(3);
    $('#navStep3').disabled = false;
  });

  $('#step3Back').addEventListener('click', () => {
    showStep(2);
  });

  // Step 3 → 4
  $('#goShoppingList').addEventListener('click', () => {
    state.shoppingChecked.clear();
    generateShoppingList();
    showStep(4);
    $('#navStep4').disabled = false;
  });

  $('#step4Back').addEventListener('click', () => showStep(3));

  // Copy plan list (Step 3)
  $('#copyPlanList').addEventListener('click', async () => {
    let lines = ['📅 我的五日午餐计划及食材', '─'.repeat(32), ''];
    state.weekPlan.forEach((meal, idx) => {
      if (!meal) return;
      lines.push(`${DAYS[idx].label}：${meal.nameZh || meal.name}`);
      const ings = Array.isArray(meal.ingredients) 
        ? meal.ingredients.map(i => typeof i === 'string' ? i : i.name).join('、') 
        : '';
      lines.push(`  食材：${ings || '暂无详细食材'}\n`);
    });
    lines.push('由 LunchPlan 生成 🍱');
    
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      showToast('📋 计划及食材已复制到剪贴板！');
    } catch {
      showToast('❌ 复制失败，请重试');
    }
  });

  // Copy shopping list
  $('#copyList').addEventListener('click', copyShoppingList);

  // Clear checked items
  $('#clearChecked').addEventListener('click', () => {
    $$('.shopping-item.checked').forEach(el => {
      state.shoppingChecked.delete(el.dataset.item);
      el.classList.remove('checked');
      el.querySelector('.item-checkbox').textContent = '';
    });
    updateShoppingProgress();
    showToast('已清除所有勾选');
  });

  // Step nav bar
  $$('.step-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      const step = parseInt(btn.dataset.step, 10);
      if (step === 3) { generateWeekPlan(); renderWeekPlan(); }
      if (step === 4) { state.shoppingChecked.clear(); generateShoppingList(); }
      showStep(step);
    });
  });
}

// ============================================================
// UTILS
// ============================================================
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  buildCategoryAccordion();
  initNavigation();
  updateSelectionUI();
});
