class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    //** 建立query */
    const queryObj = { ...this.queryString };

    // 1A) Filtering
    // 如果req.query有包含'page', 'sort', 'limit', 'fields' 以上這些屬性就把它刪除
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    // 1B) Advanced filter
    // http://192.168.2.3:5000/api/v1/tours?price[gte]=1200&duration[gte]=5
    // gte:大於等於, gt:大於, lte:小於等於, lt:小於
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`); // 將gte, gt, lte, lt替換成$gte, $gt, $lte, $lt

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    // 2) Sorting
    // http://192.168.2.3:5000/api/v1/tours?sort=-price,-ratingsAverage
    // - 代表由大到小
    // 如果不指定排列方式,默認最新創建的tour在最上面

    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    // 3) Field Limiting
    // http://192.168.2.3:5000/api/v1/tours?fields=name,duration,price
    // 只返回 name,duration,price 這三個欄位
    // 前面帶負號表示不要返回這個屬性,例如 -name, -duration, -price
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      // __v是mongodb內建的屬性,這邊預設返回時不要帶有__v這個屬性,前面的 - 負號 代表不要返回這個屬性
      this.query = this.query.select('-__v');
    }

    return this;
  }

  pagination() {
    // http://192.168.2.3:5000/api/v1/tours?page=2&limit=10
    // skip()代表要跳過幾筆數據
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
