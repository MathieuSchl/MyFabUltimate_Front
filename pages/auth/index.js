import axios from "axios";
import { getCookie, setCookies } from "cookies-next";
import { useEffect, useState } from "react"
import router from "next/router";
import { toast } from "react-toastify";
import Link from 'next/link';
import MicrosoftLogin from "react-microsoft-login";
import { fetchAPIAuth, parseCookies } from "../../lib/api";

export default function Auth() {



  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const [error, setError] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (router.query.mail != null) {
      if (router.query.mail == 'ok') {
        toast.success("Votre e-mail a été vérifié. Vous pouvez désormais vous connecter.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });

      } else {
        toast.error("Une erreur est survenue lors de la vérification de votre e-mail.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
      router.replace('/auth')
    }
  })

  async function login() {
    await axios({
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      url: process.env.API + '/api/user/login',
      data: {
        email,
        password
      },
    }).then((response) => {
      if (response.status == 200) {
        if (checked) {
          setCookies('jwt', response.data.dvflCookie, { expires: new Date(Date.now() + 2592000) });
        } else {
          setCookies('jwt', response.data.dvflCookie);
        }
        router.push('/panel');
      } if (response.status == 204) {
        toast.warning("Votre adresse e-mail n'est pas validée. Veuillez vérifier vos mails.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    })
      .catch((error) => {
        console.log(error);
        setError(true);
        setTimeout(() => setError(false), 5000);
        toast.error("Impossible de vous connecter. Vérifiez votre mot de passe ou votre e-mail.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      })
  }

  const authHandler = async (err, data) => {
    if(err){
      return
    }
    {/*toast.info("Connexion en cours, veuillez patienter...", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });*/}
    if (data == null) {
      toast.warn("Oups, impossible de continuer l'authentification. Vérifier si les pop-ups ne sont pas bloqués.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
    await axios({
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        "Authorization": "Bearer " + data.accessToken
      },
      url: process.env.API + '/api/user/login/microsoft',
    }).then(async (response) => {
      if (response.status == 200) {
        if (checked) {
          setCookies('jwt', response.data.dvflCookie, { expires: new Date(Date.now() + 2592000) });
        } else {
          setCookies('jwt', response.data.dvflCookie);
        }
        toast.success("Vous êtes désormais connecté ! Bienvenue " + data.givenName + " !", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });

        await axios({
          method: 'GET',
          headers: {
            "dvflCookie": getCookie('jwt')
          },
          url: process.env.API + '/api/user/authorization',
        }).then((response) => {
          if(response.data.myFabAgent == 1){
            router.push('/panel/admin')
          } else {
            router.push('/panel');
          }
        });

      }
    })
      .catch((error) => {
        console.log(error);
        setError(true);
        setTimeout(() => setError(false), 5000);
        toast.error("Impossible de vous connecter. Veuillez contacter fablab@devinci.fr.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        window.sessionStorage.clear();
        router.replace(router.asPath)
      })
  };
  const microsoftAvalable = false;

  return (
    <div className="min-h-screen bg-white flex">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <img
              className="h-12 w-auto"
              src={process.env.BASE_PATH + "/logo.png"}
              alt="Devinci FabLab"
            />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Connectez-vous à MyFab</h2>
          </div>

          <div className="mt-8">
            <div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Se connecter avec</p>

                <div className="mt-1">
                  <div className="">
                   {typeof window === 'undefined' || !microsoftAvalable ? <div>
                     <div className="cursor-pointer w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-105 hover:bg-black hover:text-white duration-300" onClick={()=>{
                       toast.error("La connection avec les LéoID est actuellement indisponible.", {
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: true,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                      });
                     }}>
                        <span className="sr-only">Mon compte LéoID</span>
                        <img src={process.env.BASE_PATH + "/photo/Microsoft_logo.svg"} className="h-5 w-5" />
                        <p className="ml-2">Mon compte LéoID</p>
                      </div>
                   </div> : <MicrosoftLogin clientId={"ef1c4fd1-7f30-4d56-b2f0-d6191b5319ba"} authCallback={authHandler} prompt="select_account" withUserData={true} debug={true} children={<div
                        className="cursor-pointer w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-105 hover:bg-black hover:text-white duration-300"
                      >
                        <span className="sr-only">Mon compte LéoID</span>
                        <img src="/photo/Microsoft_logo.svg" className="h-5 w-5" />
                        <p className="ml-2">Mon compte LéoID</p>
                      </div>}/>}
                  </div>

                </div>
              </div>

              <div className="mt-6 relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Ou continuer avec</span>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <div className="space-y-6">
                <div className="">
                  <label htmlFor="email" className={`block text-sm font-medium ${error ? 'text-red-500' : 'text-gray-700'}`}>
                    Adresse e-mail
                  </label>
                  <div className="mt-1">
                    <input
                      onChange={(e) => setEmail(e.target.value)}
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className={`appearance-none block w-full px-3 py-2 border ${error ? 'border-red-300 ' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="password" className={`block text-sm font-medium ${error ? 'text-red-500' : 'text-gray-700'}`}>
                    Mot de passe
                  </label>
                  <div className="mt-1">
                    <input
                      onChange={(e) => setPassword(e.target.value)}
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      className={`appearance-none block w-full px-3 py-2 border ${error ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      onChange={() => setChecked(!checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                      Se souvenir de moi
                    </label>
                  </div>

                  <div className="text-sm">
                    <Link href="/auth/forget"><a className="font-medium text-indigo-600 hover:text-indigo-500">
                      Mot de passe oublié ?
                    </a></Link>

                  </div>
                </div>

                <div>
                  <button
                    onClick={() => login()}
                    onSubmit={() => login()}
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Se connecter
                  </button>
                  <p className="text-sm text-center text-gray-500 p-1">La connexion par adresse e-mail est réservée aux anciens comptes MyFab.</p>
                  {/*<Link href="/auth/register">
                    <p className="text-sm text-center text-gray-500 p-1 hover:cursor-pointer">S'inscrire</p>
  </Link>*/}
                  <Link href="/">
                    <p className="text-sm text-center font-medium text-indigo-600 hover:text-indigo-500 mt-5 hover:cursor-pointer">Retourner sur MyFab</p>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="hidden lg:block relative w-0 flex-1">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="https://media.lesechos.com/api/v1/images/view/5d9c7a8c3e45463dde1e2ad6/1280x720/0602009053500-web-tete.jpg"
          alt=""
        />
      </div>
    </div>
  )
}

export async function getServerSideProps({ req }) {
  const cookies = parseCookies(req);
  const user = await fetchAPIAuth("/user/me", cookies.jwt);

  if(user.error == null){
    return {
      redirect: {
        permanent: false,
        destination: "/panel/",
      },
      props:{},
    };  }

  return {
    props: { }, // will be passed to the page component as props
  }
}