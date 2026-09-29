// Delt mellom SiteHeader og SiteMenu (mobilmenyen) slik at de garantert har
// nøyaktig samme farge — ikke to kopier som kan gli fra hverandre. Lagt i en
// egen fil i stedet for å eksportere fra SiteHeader.tsx, siden SiteMenu
// importeres AV SiteHeader — å importere tilbake derfra hadde gitt en
// sirkulær import.
//
// #2E362C (ønsket av Åshild, litt mørkere/kaldere enn den opprinnelige #333E31)
// mot #E2DDD7 måler fortsatt godt over WCAG AAA (7:1) på den tynne nav-teksten.
export const HEADER_BG = "#2E362C";
export const HEADER_TEXT = "#E2DDD7";
