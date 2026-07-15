"use client";

import { useSearch } from "@/hooks/useSearch";

import Sidebar from "./sidebar/Sidebar";

import MedicalMap from "@/components/map/MedicalMap";


type PublicHomeProps = {
  query?: string;
};


export default function PublicHome({
  query = "",
}: PublicHomeProps) {


  const {
    data,
    isLoading,
  } = useSearch({
    query,
  });



  const structures =
    data?.results.map(
      (item) => item.structure
    ) ?? [];



  return (

    <div
      className="
        flex
        h-full
        min-h-0
        w-full
      "
    >


      {/* Sidebar résultats */}
      <aside
        className="
          w-[390px]
          xl:w-[420px]
          shrink-0
          border-r
          border-border
          bg-background
        "
      >

        <Sidebar
          results={data?.results ?? []}
          loading={isLoading}
        />

      </aside>




      {/* Carte */}
      <section
        className="
          flex-1
          bg-muted/15
          p-4
          lg:p-5
        "
      >

        <div
          className="
            relative
            h-full
            overflow-hidden
            rounded-3xl
            border
            border-border
            bg-background
            shadow-sm
          "
        >

          <MedicalMap
            structures={structures}
          />


        </div>


      </section>


    </div>

  );
}