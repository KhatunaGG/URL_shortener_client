import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import "./App.css";
import { NewUrlType, UrlType } from "./interfaces";
import { BASE_URL } from "./constants";

function App() {
  const [inputUrl, setInputUrl] = useState("");
  const [urlData, setUrlData] = useState<UrlType[]>([]);
  const [count] = useState(0);
  const [editId, setEditId] = useState<string | null>(null);
  const [urlToUpdate, setUrlToUpdate] = useState<UrlType>();
  const [urlToUpdateId, setUrlToUpdateId] = useState("");

  const getAllUrls = async () => {
    try {
      const res = await axios.get(`${BASE_URL}`);
      setUrlData(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllUrls();
  }, []);

  function getRandomString(length = 10) {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?";
    let result = "";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const shortCode = getRandomString();

    try {
      const newUrl: NewUrlType = {
        url: inputUrl,
        shortCode: shortCode,
        createdAt: dayjs().format("YYYY-MM-DD HH:mm"),
        updatedAt: "",
        accessCount: count,
      };
      const res = await axios.post(`${BASE_URL}`, newUrl);

      if (res.status === 200) {
        setInputUrl("");
        getAllUrls();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleEdit = (id: string) => {
    if (editId === id) {
      setEditId(null);
    } else {
      setEditId(id);
    }
  };

  const deleteUrl = async (id: string) => {
    try {
      const res = await axios.delete(`${BASE_URL}/${id}`);
      if (res.status === 200) {
        getAllUrls();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getUrlById = async (id: string) => {
    try {
      const res = await axios.get(`${BASE_URL}/${id}`);
      setUrlToUpdate(res.data);
      setInputUrl(res.data.url);
      setUrlToUpdateId(res.data._id);
    } catch (error) {
      console.log(error);
    }
  };

  const updateUrl = async () => {
    const parentObj = urlData.find((el) => el._id === urlToUpdateId);
    const shortCode = getRandomString();
    const urlToUpdate = {
      ...parentObj,
      shortCode: shortCode,
      updatedAt: dayjs().format("YYYY-MM-DD HH:mm"),
    };
    try {
      const res = await axios.put(`${BASE_URL}/${urlToUpdateId}`, {
        urlToUpdate,
      });
      if (res.status === 200) {
        setInputUrl("");
        getAllUrls();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleRedirect = async (id: string) => {
    try {
      const res = await axios.get(`${BASE_URL}/redirect/${id}`);
      const redirectUrl = res.data.url;
      if (redirectUrl) {
        // window.location.href = redirectUrl;
        window.open(redirectUrl, "_blank");
      }
      if (res.status === 200) {
        getAllUrls();
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="w-[50%]  mx-auto my-[10vh] flex flex-col gap-8 text-slate-500">
      <div className="bg-[#cfebeb] rounded-xl p-4 flex flex-col gap-4">
        <h1 className="font-bold text-xl ">Url Shortener</h1>
        <form
          onSubmit={(e) => {
            if (!urlToUpdate) {
              handleSubmit(e);
            } else {
              updateUrl();
            }
          }}
          className="w-full flex flex-row gap-2"
        >
          <input
            onChange={(e) => setInputUrl(e.target.value)}
            type="text"
            placeholder="Enter your url..."
            className="w-full rounded-lg pl-2 outline-none"
            value={inputUrl}
          />
          <button
            type="submit"
            className="border border-slate-300 px-6 py-2 rounded-lg hover:bg-slate-300 duration-300 font-medium"
          >
            click
          </button>
        </form>
      </div>

      {urlData.length > 0 && (
        <div className="rounded-xl p-4 flex flex-col gap-6">
          <p className="px-4 text-md font-bold">Short Urls list</p>
          <ul className="w-fill flex flex-col gap-6 ">
            {urlData?.map((el, i) => (
              <li
                key={i}
                className="flex flex-col items-start gap-1 justify-between bg-white rounded-xl p-4"
              >
                <div className="w-full flex flex-row justify-between">
                  <p
                    onClick={() => handleRedirect(el._id)}
                    className="font-bold cursor-pointer hover:text-lg hover:underline duration-200"
                  >
                    {el.shortCode}
                  </p>
                  <div className="flex flex-col gep-1">
                    <p className="text-[10px] text-[#333]">
                      Created: <span className="font-bold">{el.createdAt}</span>
                    </p>
                    {el.updatedAt && (
                      <p className="text-[10px] text-[#333]">
                        {" "}
                        Updated:
                        <span className="font-bold"> {el.updatedAt}</span>
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-xs text-[#333]">
                  Access Count: {el.accessCount}
                </span>

                <div className="flex flex-row gap-10">
                  <button
                    onClick={() => handleEdit(el._id)}
                    className="mt-2 font-bold font-base"
                  >
                    Edit
                  </button>
                  {editId === el._id && (
                    <div className="flex flex-row items-center gap-4">
                      <button
                        onClick={() => getUrlById(el._id)}
                        className="mt-2 font-bold font-base"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => deleteUrl(el._id)}
                        className="mt-2 font-bold font-base"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
