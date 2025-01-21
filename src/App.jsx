import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Modal } from 'bootstrap';

const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;

const defaultModalState = {
  imageUrl: "",
  title: "",
  category: "",
  unit: "",
  origin_price: "",
  price: "",
  description: "",
  content: "",
  is_enabled: 0,
  imagesUrl: [""]
};

function App() {
  const [isAuth, setIsAuth] = useState(false)
  //使用者未登入是使用者未登入是false狀態，登入成功就是ture狀態，就可以渲染產品畫面


  const [products, setProducts] = useState([]);
  //這次要從API抓Products

  const [account, setAccount] = useState({
    username: "example@test.com",
    password: "example"
  })
  //宣告帳密

  const handleInputChange = (e) => { //綁定onChange
    const { value, name } = e.target; //value, name可以被解構出來
    setAccount({
      ...account, //展開
      [name]: value //可以把帳密的值帶入
    })
  } //帶入帳密

  const getProducts = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/v2/api/${API_PATH}/admin/products`
      );
      setProducts(res.data.products);
    } catch (error) {
      alert("取得產品失敗");
    }
  }; //取得產品

  const handleLogin = (e) => {
    e.preventDefault();
    axios.post(`${BASE_URL}/v2/admin/signin`, account)
      .then((res) => {
        const { token, expired } = res.data;
        document.cookie = `myToken=${token}; expires = ${new Date(expired)}`;

        axios.defaults.headers.common['Authorization'] = token;

        getProducts();
        setIsAuth(true);
      })
      .catch((err) => {
        alert("登入失敗~")
        console.log(err)
      })
  } //登入頁面

  const checkUserLogin = () => {
    axios.post(`${BASE_URL}/v2/api/user/check`)
      .then((res) => {
        setIsAuth(true)
        getProducts();
      })
      .catch((err) => alert("登入失敗!"))
  } //若驗證成功則跳轉到後台產品頁面

  useEffect(() => {
    const token = document.cookie.replace(
      /(?:(?:^|.*;\s*)myToken\s*\=\s*([^;]*).*$)|^.*$/,
      "$1",
    );
    axios.defaults.headers.common['Authorization'] = token;
    checkUserLogin();
  }, []) //驗證帶入token

  const productModalRef = useRef(null);
  //宣告modal
  const deleteProductModalRef  = useRef(null);
  //宣告刪除modal
  const [modalMode, setmodalMode] = useState(null);
  //宣告modal要開啟產品modal時帶入產品value

  useEffect(() => {
    new Modal(productModalRef.current, {
      backdrop: false, //若不要點擊空白區域關閉modal 
    });
    new Modal(deleteProductModalRef.current, {
      backdrop: false, //若不要點擊空白區域關閉modal 
    });
  }, [])
  //建立modal實例

  const handleOpenProductModal = (mode, product) => {
    setmodalMode(mode); //傳入mode參數
    switch (mode) { //判斷為新增還編輯
      case "create":
        setTempProduct(defaultModalState);
        break;
      case "edit":
        setTempProduct(product);
        break;
      default:
        break;
    }
    const modalInstance = Modal.getInstance(productModalRef.current);
    modalInstance.show();
  }//打開modal

  const handleCloseProductModal = () => {
    const modalInstance = Modal.getInstance(productModalRef.current);
    modalInstance.hide();
  }//關閉modal

  const handleOpenDeleteProductModal = (product) => {
    setTempProduct(product); //為了在刪除時帶入產品
    const modalInstance = Modal.getInstance(deleteProductModalRef.current);
    modalInstance.show();
  }//打開刪除modal

  const handleCloseDeleteProductModal = () => {
    const modalInstance = Modal.getInstance(deleteProductModalRef.current);
    modalInstance.hide();
  }//關閉刪除modal


  const [tempProduct, setTempProduct] = useState(defaultModalState);

  const handleModalInputChange = (e) => {
    const { value, name, checked, type } = e.target; //解構出解構出e.target裡面
    setTempProduct({
      ...tempProduct,
      [name]: type === "checkbox" ? checked : value //對應name修改欄位的值是checked或value
    });
  }

  const handleImageChange = (e, index) => { //index是為了判斷第幾張圖
    const { value } = e.target; //解構出解構出e.target裡面
    const newImages = [...tempProduct.imagesUrl]; //設一個新陣列
    newImages[index] = value; //透過index更改對應欄位
    setTempProduct({ //傳入圖片網址
      ...tempProduct,
      imagesUrl: newImages
    });
  }

  const handleAddImage = () => {
    const newImages = [...tempProduct.imagesUrl, ""]; //設一個新陣列後加入空字串
    setTempProduct({ //傳入圖片網址
      ...tempProduct,
      imagesUrl: newImages
    });
  }

  const handleCancelImage = () => {
    const newImages = [...tempProduct.imagesUrl]; //設一個新陣列
    newImages.pop(); //陣列最後一個值刪除
    setTempProduct({ //傳入圖片網址
      ...tempProduct,
      imagesUrl: newImages
    });
  }

  const createProduct = async () => {
    try {
      await axios.post(`${BASE_URL}/v2/api/${API_PATH}/admin/product`, {
        data: {
          ...tempProduct,
          origin_price: Number(tempProduct.origin_price), //轉字串
          price: Number(tempProduct.price),
          is_enabled: tempProduct.is_enabled ? 1 : 0 //是否啟用
        }
      })
    } catch (error) {
      alert("新增產品失敗，請填入必填資料");

    }
  }

  const editProduct = async () => {
    try {
      await axios.put(`${BASE_URL}/v2/api/${API_PATH}/admin/product/${tempProduct.id}`, {
        data: {
          ...tempProduct,
          origin_price: Number(tempProduct.origin_price), //轉字串
          price: Number(tempProduct.price),
          is_enabled: tempProduct.is_enabled ? 1 : 0 //是否啟用
        }
      })
    } catch (error) {
      alert("編輯產品失敗，請填入必填資料");
    }
  }

  const deleteProduct = async () => {
    try {
      await axios.delete(`${BASE_URL}/v2/api/${API_PATH}/admin/product/${tempProduct.id}`, {
        data: {
          ...tempProduct,
          origin_price: Number(tempProduct.origin_price), //轉字串
          price: Number(tempProduct.price),
          is_enabled: tempProduct.is_enabled ? 1 : 0 //是否啟用
        }
      })
    } catch (error) {
      alert("刪除產品失敗");
    }
  }

  const handleUpdateProduct = async () => {
    const apiCall = modalMode === "create" ? createProduct : editProduct; //判斷新增或是編輯
    try {
      await apiCall(); //呼叫新增或是編輯
      getProducts(); //將產品放入list
      handleCloseProductModal(); //關閉modal
    } catch (error) {
      alert("更新產品失敗");
    }
  }

  const handleDeleteProduct = async () => {
    try {
      await deleteProduct(); //刪除產品
      getProducts();  //將產品放入list
      handleCloseDeleteProductModal(); //關閉刪除modal
    } catch (error) {
      alert("刪除產品失敗");
    }
  }

  return (
    <>
      {/*產品列表*/}
      {isAuth ? (<div className="container py-5">
        <div className="row">
          <div className="col">
            <h2>產品列表</h2>
            <button type="button" onClick={() => { handleOpenProductModal("create") }} className="btn btn-success">新增產品</button>
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">產品名稱</th>
                  <th scope="col">原價</th>
                  <th scope="col">售價</th>
                  <th scope="col">是否啟用</th>
                  <th scope="col">編輯及刪除</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <th scope="row">{product.title}</th>
                    <td>{product.origin_price}</td>
                    <td>{product.price}</td>
                    <td>{product.is_enabled? <span className="text-success">啟用</span> : <span>未啟用</span>}</td>
                    <td>
                      <div className="btn-group">
                        <button type="button" onClick={() => { handleOpenProductModal("edit", product) }} className="btn btn-success btn-sm">編輯</button>
                        {/*在編輯按鈕帶入參數，帶入產品資料*/}
                        <button  onClick={() => handleOpenDeleteProductModal(product)}  type="button" className="btn btn-danger btn-sm">刪除</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

          </div>
        </div>
      </div>
      ) : (<div className="d-flex flex-column justify-content-center align-items-center vh-100">
        <h1 className="mb-5">歡迎登入</h1>
        <form onSubmit={handleLogin} className="d-flex flex-column gap-3">
          <div className="form-floating mb-3">
            <input name="username" value={account.username} onChange={handleInputChange} type="email" className="form-control" id="username" placeholder="name@example.com" />
            <label htmlFor="username">Email address</label>
          </div>
          <div className="form-floating">
            <input name="password" value={account.password} onChange={handleInputChange} type="password" className="form-control" id="password" placeholder="Password" />
            <label htmlFor="password">Password</label>
          </div>
          <button className="btn btn-success">登入</button>
        </form>
        <p className="mt-5 mb-3 text-muted">&copy; 2024~∞ - 乳蛋農產品</p>
      </div>
      )}
      {/*modal*/}
      <div ref={productModalRef} id="productModal" className="modal" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
        <div className="modal-dialog modal-dialog-centered modal-xl">
          <div className="modal-content border-0 shadow">
            <div className="modal-header border-bottom">
              <h5 className="modal-title fs-4">{modalMode === "create" ? "新增產品" : "編輯產品"}</h5>
              <button type="button" onClick={handleCloseProductModal} className="btn-close" aria-label="Close"></button>
            </div>

            <div className="modal-body p-4">
              <div className="row g-4">
                <div className="col-md-4">
                  <div className="mb-4">
                    <label htmlFor="primary-image" className="form-label">
                      主圖
                    </label>
                    <div className="input-group">

                      <input
                        value={tempProduct.imageUrl}
                        onChange={handleModalInputChange}
                        name="imageUrl"
                        type="text"
                        id="primary-image"
                        className="form-control"
                        placeholder="請輸入圖片連結"
                      />
                    </div>

                    <img src={tempProduct.imageUrl}
                      alt={tempProduct.title}
                      className="img-fluid"
                    />
                  </div>

                  {/* 副圖 */}
                  <div className="border border-2 border-dashed rounded-3 p-3">
                    {tempProduct.imagesUrl?.map((image, index) => (
                      <div key={index} className="mb-2">
                        <label
                          htmlFor={`imagesUrl-${index + 1}`}
                          className="form-label"
                        >
                          副圖 {index + 1}
                        </label>
                        <input
                          value={image}
                          onChange={(e) => handleImageChange(e, index)} //index判斷第幾張圖
                          id={`imagesUrl-${index + 1}`}
                          type="text"
                          placeholder={`圖片網址 ${index + 1}`}
                          className="form-control mb-2"
                        />
                        {image && (
                          <img
                            src={image}
                            alt={`副圖 ${index + 1}`}
                            className="img-fluid mb-2"
                          />
                        )}
                      </div>
                    ))}
                    <div className="btn-group w-100">
                      {tempProduct.imagesUrl.length < 5 &&
                        tempProduct.imagesUrl[tempProduct.imagesUrl.
                          length - 1] !== "" && (
                          <button onClick={handleAddImage} className="btn btn-outline-primary btn-sm w-100">新增圖片</button>
                        )} {/* 小於5張圖，裡面又有值不等於空字串，可以加上新增按鈕 */}
                      {tempProduct.imagesUrl.length > 1 && (
                        <button onClick={handleCancelImage} className="btn btn-outline-danger btn-sm w-100">取消圖片</button>
                      )} {/* 大於1張圖，可以加上取消按鈕 */}
                    </div>
                  </div>
                </div>

                <div className="col-md-8">
                  <div className="mb-3">
                    <label htmlFor="title" className="form-label">
                      標題
                    </label>
                    <input
                      value={tempProduct.title} //
                      onChange={handleModalInputChange} //
                      name="title"
                      id="title"
                      type="text"
                      className="form-control"
                      placeholder="請輸入標題"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="category" className="form-label">
                      分類
                    </label>
                    <input
                      value={tempProduct.category} //
                      onChange={handleModalInputChange} //
                      name="category"
                      id="category"
                      type="text"
                      className="form-control"
                      placeholder="請輸入分類"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="unit" className="form-label">
                      單位
                    </label>
                    <input
                      value={tempProduct.unit} //
                      onChange={handleModalInputChange} //
                      name="unit"
                      id="unit"
                      type="text"
                      className="form-control"
                      placeholder="請輸入單位"
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label htmlFor="origin_price" className="form-label">
                        原價
                      </label>
                      <input
                        value={tempProduct.origin_price} //
                        onChange={handleModalInputChange} //
                        min="0"
                        name="origin_price"
                        id="origin_price"
                        type="number"
                        className="form-control"
                        placeholder="請輸入原價"
                      />
                    </div>
                    <div className="col-6">
                      <label htmlFor="price" className="form-label">
                        售價
                      </label>
                      <input
                        value={tempProduct.price} //
                        onChange={handleModalInputChange} //
                        name="price"
                        min="0"
                        id="price"
                        type="number"
                        className="form-control"
                        placeholder="請輸入售價"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">
                      產品描述
                    </label>
                    <textarea
                      value={tempProduct.description} //
                      onChange={handleModalInputChange} //
                      name="description"
                      id="description"
                      className="form-control"
                      rows={4}
                      placeholder="請輸入產品描述"
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="content" className="form-label">
                      說明內容
                    </label>
                    <textarea
                      value={tempProduct.content} //
                      onChange={handleModalInputChange} //
                      name="content"
                      id="content"
                      className="form-control"
                      rows={4}
                      placeholder="請輸入說明內容"
                    ></textarea>
                  </div>

                  <div className="form-check">
                    <input
                      checked={tempProduct.is_enabled} //
                      onChange={handleModalInputChange} //
                      name="is_enabled"
                      type="checkbox"
                      className="form-check-input"
                      id="isEnabled"
                    />
                    <label className="form-check-label" htmlFor="isEnabled">
                      是否啟用
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer border-top bg-light">
              <button type="button" onClick={handleCloseProductModal} className="btn btn-secondary">
                取消
              </button>
              <button type="button" onClick={handleUpdateProduct} className="btn btn-success">
                確認
              </button>
            </div>
          </div>
        </div>
      </div>
      {/*刪除modal*/}
      <div
        ref={deleteProductModalRef}
        className="modal fade"
        id="delProductModal"
        tabIndex="-1"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5">刪除產品</h1>
              <button
                onClick={handleCloseDeleteProductModal}
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              你是否要刪除
              <span className="text-danger fw-bold">{tempProduct.title}</span>
            </div>
            <div className="modal-footer">
              <button
                onClick={handleCloseDeleteProductModal}
                type="button"
                className="btn btn-secondary"
              >
                取消
              </button>
              <button onClick={handleDeleteProduct} type="button" className="btn btn-danger">
                刪除
              </button>
            </div>
          </div>
        </div>
      </div>
    </>

  )
}

export default App


