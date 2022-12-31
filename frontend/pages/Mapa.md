## Lista stron:
#### Login
* czy dane logowania są zapisane, w pamięci telefonu
#### FormLogOut
* czy dane logowania są zapisane, w pamięci telefonu
#### Register
* czy dane logowania są zapisane, w pamięci telefonu
#### Tablica
* login
* hasło
* filtry wyszukiwania
    * nazwa
    * sport
    * zaawansowanie
    * miejsce
    * czas
    * cena
    * ilość miejsc
#### Wiadomosci
* login
* hasło
* zakładka
* filtr
#### Konto
* login
* hasło
* zakładka
* filtry wyszukiwania
    * nazwa
    * sport
    * zaawansowanie
    * miejsce
    * czas
    * cena
    * ilość miejsc
#### ItemTablicaPage
* login
* hasło
* id meczu
* źródło
#### Search
* źródło
#### FormMecz
* login
* hasło
* tryb (utwórz czy edytuj)
* jeśli edytuj to id meczu
* źródło
#### FormGroup
* login
* hasło
* tryb (utwórz czy edytuj)
* jeśli edytuj to id grupy
* źródło
#### FormWiadomosci
* login
* hasło
* tryb (użytkownik lub grupa)
* id docelowe
* źródło
#### FormMeczRemoveUser
* login
* hasło
* id docelowe
* źródło
#### FormChangeLogin
* login
* hasło
* źródło
#### FormChangePassword
* login
* hasło
* źródło
---
## Komponenty
#### BottomBar
* aktywna zakładka
#### ItemTablica
* login
* hasło
* wszystkie parametry meczu
#### ItemWiadomosci
* login
* hasło
* id
* tytuł
* avatar
* typ (użytkownik, czy grupa)
#### ItemMessage
* nazwa
* tytuł
* typ (text, czy zdjęcie)
#### PopUpServer
* treść komunikatu
---
## Lista linków i dannych między stronami:
#### Wejścia
* Login -> Tablica
* Register -> Tablica
#### Tablica
* Tablica -> FormMecz
* Tablica -> Search
* Tablica (przez ItemTablica) -> ItemTablicaPage
* Tablica (przez BottomBar) -> Wiadomosci
* Tablica (przez BottomBar) -> Konto
#### Wiadomosci
* Wiadomosci -> Search
* Wiadomosci -> FormGroup
* Wiadomosci (przez ItemWiadomosci) -> FormWiadomosci
* Wiadomosci (przez BottomBar) -> Tablica
* Wiadomosci (przez BottomBar) -> Konto
## Konto
* Konto -> Search
* Konto -> FormGroup
* Konto (przez ItemTablica) -> ItemTablicaPage
* Konto (przez BottomBar) -> Tablica
* Konto (przez BottomBar) -> Wiadomosci
## ItemTablicaPage
* ItemTablicaPage (przez powrót) -> Tablica
* ItemTablicaPage (przez powrót) -> Konto
* ItemTablicaPage (przez BottomBar) -> Tablica
* ItemTablicaPage (przez BottomBar) -> Wiadomosci
* ItemTablicaPage (przez BottomBar) -> Konto
## Search
* Search (przez powrót lub wyszukanie) -> Tablica
* Search (przez powrót lub wyszukanie) -> Wiadomosci
* Search (przez powrót lub wyszukanie) -> Konto
* Search (przez BottomBar) -> Tablica
* Search (przez BottomBar) -> Wiadomosci
* Search (przez BottomBar) -> Konto
## FormMecz
* FormMecz (przez powrót lub potwierdzenie) -> Tablica
* FormMecz (przez powrót lub potwierdzenie) -> Konto
* FormMecz (przez BottomBar) -> Tablica
* FormMecz (przez BottomBar) -> Wiadomosci
* FormMecz (przez BottomBar) -> Konto
## FormGroup
* FormGroup -> Wiadomosci
## FormWiadomosci
* FormWiadomosci -> Wiadomosci
## FormMeczRemoveUser
* FormMeczRemoveUser -> ItemTablicaPage
## FormChangeLogin
* FormChangeLogin -> Konto
## FormChangePassword
* FormChangePassword -> Konto
---
## Notki
- formularze pełnią tylko rolę pętli zwrotnej