"use client";
import {createContext,useContext,useEffect,useState} from "react";
type Lang="en"|"ko";const C=createContext<{lang:Lang;setLang:(x:Lang)=>void}>({lang:"en",setLang:()=>{}});
export function LanguageProvider({children}:{children:React.ReactNode}){const[lang,setState]=useState<Lang>("en");useEffect(()=>{const saved=localStorage.getItem("suguwa-lang") as Lang|null;setState(saved==="ko"||saved==="en"?saved:navigator.language.toLowerCase().startsWith("ko")?"ko":"en")},[]);const setLang=(x:Lang)=>{setState(x);localStorage.setItem("suguwa-lang",x);document.documentElement.lang=x};useEffect(()=>{document.documentElement.lang=lang},[lang]);return <C.Provider value={{lang,setLang}}>{children}</C.Provider>}
export const useLang=()=>useContext(C);
