'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { API_BASE } from '../lib/constants';

function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CITYHOMES_LOGO = 'data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCACDAc8DASIAAhEBAxEB/8QAHAABAAIDAQEBAAAAAAAAAAAAAAYHBAUIAwIB/8QAURAAAAQEAQYICwQHBAoDAAAAAAECAwQFBhESBxMhMUHRFBUWUVVhkZMiMjZWcXN0gaGxsjRTlMEIFyM1QlKSN2JygiQzQ1R1s8Lh4vBjZIT/xAAcAQEAAQUBAQAAAAAAAAAAAAAAAQIDBAUGBwj/xABGEQABAwIDBAQHDQcEAwAAAAABAAIDBBEFEjEGIUFRE3GBkRQiMmGhsdEHFRYjMzRCUnKSweHwFyU1VKLi8TZDYoJTs9L/2gAMAwEAAhEDEQA/AOMgAARAAARAGdJpVHzeLKFgIdTq/wCI9SUlzmewha1I0RASbBExeGMji0koy8Bs/wC6X5n8BjVFXHAN+vJb/BdnKzFnfFizOLjp2cz5u+yiFI0FGTHBFzXHCQh6SRazjhej+Eus+zaJbUFByiOgUNwDSYGIaTZC0lcldSuf06/SJcA0cldM9+a9l6zR7J4bTUxgdHmvqTqeo8Oxc/TuUx8njDhY9hTa/wCFWtKy5yPaQwB0LNpbBTWDVCR8Ol5o+fWk+cj2GKnrCio2TGuKhMUXAlpNRF4bZf3i5usvgNrS17ZfFduK872g2OqMOvNT3fH6R18x5x22USAAGwXFoAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIADMlMtjprFphYCHW86eu2pJc5nqIhBIAuVXHG+V4YwXJ0A1WGJjSNCxs1wRUxxwcGekiMv2jhdRHqLrPsEvpGhoGU4IqPwRkaWkrl+zbPqI9Z9Z/ATAaipxL6MXevTMB2F0mxDsZ/8AR/Ad/BYkqlsFK4RMLAQ6GWi2JLSZ85nrMxlgA1BJJuV6XHGyJoYwWA0A0QAAQq0A9JWMABFBKxoFiNxxsmJEPE61Mam1+j+U/h6BWEZDREHErhoplbLyDspCysZDooaipadls+hs3GNYXUl+zfRoWjeXUY2VLiDo/Fk3hcHtBsVDWXno7Mfy+ifYfR61QwDd1RTMykD9ohGdhlHZuIQXgq6j5j6j+I0g3jHteMzTcLyWppZqWUxTNLXDgUAAFSsIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACKXUjREfOMEVGYoOCPSSjLw3C/ulzdZ/EWrJ5XASiEKFgIdLLZazLWo+cz2mPeB+wserT8h7DmamqkmO/TkvfcD2eo8KjDoxd5G9x17OQ6u26AADFXQIAw5vNIGUwhxUfEJZbLVfWo+Yi2mKpq6uI6b44WCxQcEegyI/DcL+8ewuoviMmnpZJzu05rQ41tFR4Sz403fwaNe3kPOey6l9XV3BSzHCSzBGRhaDVe7bZ9Z7T6i7RGqZyhTCFijRODOLh3FXNZERLbvzbDLqEHAbtlBC1mUi/nXlNVthic1UJ2vygaNGnaOPb2WXREujoSYwiIqCfQ+yvUpJ/A+Y+oZAoGn53MZHF8IgXjSR+O2rShZcxl+esW7SdWS6ftk2kyh4wi8JhZ6T60ntL4jU1VC+HxhvC9GwDa2mxQCKTxJeXA9R/DXrUhAAGCuuXnEMsxLC2IhpDrSyspCyuRl1kK0rHJ+4xjjZElTrWtUMZ3Un/Dzl1a/SLPAX4Kh8Bu0rUYvglJisWSdu8aEaj9ctFzgojSo0qIyMjsZHsH4JplgZaaqdlTbaEG5CpWs0lbEeJRXPnOxEIWOlhk6RgfzXg+J0RoKuSmJvlNroA21NSGOnsWbMKkkNo/1ryvFQX5n1CzJPRMigG0m7D8MdLWt/SX9Or5i6BdYBcAqdAX0UplZJwlLYLDzZhNvkNTN6LkMehWCFKEdPUtjwbf5dXwE5VTnVNgNhUMsXJ5w/LlupdNoy8NJWuRkRlo9Bi0pVS8gdlcI65LGVLWwhSjMz0maSvtEAXVRdZU6AnNEyiWxtTTeGi4Rt1llSibQq9k2WZfITLknTnRTHae8A26gusqUAXZyTp3opjtPePzknTnRTHae8TlUZwqUAXKzT9LxEXEQyZZD52HNJLTpLQaSMj1/wDtjECyh0+mTTJL8K3hgojSgi1IVtT+Zf8AYQRZSHXUXABYuT6koWIlpzGbQxO5/wD1LarlZP8AN7/l6QAupJsq6ASzKKmTQkaiWyqCZaca8J9xNzO56k6/efuETEFAboAC5pBStPREil770rZW65CtrWozPSZpIzPWMeoqWwAFw1W9wTAp8Ye9kLgMovvv+AKpkBn1Cy1Dz+Yw7KCQ01FOoQktRJJZkRDAF9puAVp5YzFI5h1BI7kAT/JXJZXNYSOXMINuIU24gkGq+gjI+YYuVWUy6VRUAmXwqIdLiFmsk302MraxjCqaZuhtvW8fs7O3CxiRcMh4b7625W9KhQAWk7ELApPJ65FNIjJ2txhtWlMOjQsy/vHs9Gv0C7NOyFt3lYGGYTVYnL0VM254ngOsqvwF9QVNSCDQSGJTCaNq2yWrtVcx9RdPSKKQaHpTBnfalokq7SsY1/vqy/kldkPc7q8lzM2/Kxt3/kqDAWRVOTpKWlxUiWozTpOGcO9/8KvyPtFcrQptakLSaVpOykmVjI+YZ8M7JhdhXIYpg9XhcnR1DbX0PA9R/RXyPo0LJtLhpMkKM0kq2gzK1y+Jdo+RYxU5wrJZDqQ3/pbeKMTo0mRnpL3pIveRBNM2K1+JsmGYXLiHSiPVjS7rsRu9irkAAXlq1+oSpaiQkjUpR2Ii1mYKSaVGlRGRkdjI9glmS2UcY1EmKdRdiCInDvqNf8Jdtz9w1dbQfAarmLBFZOeNxJdSvCL5iyJmmUx8QLraPwuVmHtrneS5xaO7X0Edi0wDc0TCw8bVMDCxTSXWXFmS0HqPwTMW1yQprohjtVvFmorGQODXBbLBNlqnGIXTRPaADbffkDwB5qjAF58kKa6JY7VbxqawpmQwdMx8TDS1lt5tq6FkZ3I7+kWmYlG5waAd62dRsHWwQuldI2zQTx4C/JVEA3FJSJ+oJqmEbVm2kljectfAneewW7K6UkEuZJDUtYdURaXH0k4o+u56vdYXaitZAcp3lazA9lavF2GVpDWaXPHqCooBfUZTshjWjQ9KoMyP+JDZIV2psYqyvaXOnottyHWpyCfM82ataFfyn+R7hFPXRzOy6FXsa2Qq8Lh6fMHsGpGo6xyVxwP2Fj1afkPYeMD9hY9Wn5D2HOnVe2xeQOpBFq4q9qnsMKyyb8c43jSStCEkZmRGZ7dJHoL4CUipMsflQx7Gj61jKoomyyhrtFz+1eIT4fhzpYDZ1wL8rqLTeZx02i1RUfELecPVfUkuYi1EQwwAdIAGiwXhMkj5Xl7zcnUnVAABKoQfTa1tOJcbWpC0ndKknYyPnIx8gCkEg3CsijsoNsEFPldSIoi+svzL384sdKiUklJMjIyuRltHOA6KgPsMP6pPyIaLEadkRDm7rr1/YfGaqvjkhqHZslrHjvvrz0617AADWLvVU2WXymhvYk/WsQyGZciYlqHZTicdWSEFzmZ2ITLLJ5UQ/sSfrWNTk7ZS9WEClZXJJqX7yQZl8bDp6P5Fq+f9pz+9p/tK15BLIeTSpqCYIrIK616satqjFeVhW0ZFxTkJKX1Q8KgzTnUHZbnWR7C5rf8AYTqtYhcNSsxdbMyVmcJGWzEZJ/MUiMxxsufaL717KiolS84qIeNf8xrO43khrCcyt1JLiFxkP/E08q+jqVrL5dQjoCi6qstpVcxam0/iZgwlSW3sBkStZWQRW+AueS/uaC9nb+khQgvuS/uaC9nb+khU1UvVLTWIiIeezBUO+6yZxLhGaFmm/hHzD7lMymKprCJVHxRpN9BGRvKsfhF1jHn378j/AGlz6jHzJ/3vB+vR9RCFVwV5zMzTLIpSTMjJlZkZbPBMUZxnMukIvvlbxeU1/dUX6hf0mKCFTlSxbqmJ/Eyqetx7rrjyF+A+SlGo1I9+0tZegW1O5fCz+RrhjWlTbyCW04Wmx60qL/3UKLFj5Kp9nGzkcSvwkEaoYz2lrNPu19vMIaeCOHFRylqZiI+pFwMY0pDUIu8V7j0JI+v5XMWTVk4ZkEkU+kkk6ZZuHbtoNVtGjmLWNrgYYN5/Chs1eE6vVexWuZ9REKarWeKnk4W6gz4K1dDCerar0nu5hOgUeUVpXnHHnlvOrNbi1GpSjPSZnrMfAAKFcQX/AEx5NSv2Nn6CFAC/6Y8mpX7Gz9BDVYr5DV6L7nXzmb7I9apKqvKea+2vfWY1o6GXLZc4tS1wEKpajupRspMzPnPQPniuWdHQfcJ3ChuKNa0DKsif3PppZXSdON5J0PHtUKyK/YZl61HyMYWWr7ZLfVufNIsmGhoaGIyh4dpklaybQSb9grbLV9slvq3PmkWqeXpazPbX2LZY5h5w7Zk0znXLbb/+9/xWNknkTcdHuTaKQSmYVRJaSZaDc139xW95kJ5WNQsU9LM+tJORDhmlhq/jHzn1EMTJeylqjINSS0uqcWrrPGZfIiEFytxTj1VmwozwQ7KEpL0liM/j8BUW+FVZa7QfgrLZvg/s4yWAfGSWN/O4Xv2DRaSb1DOZo8pyLj3jSZ6G0KNKE+gi0Dzlk8m0teJyDmD7Zkfi4zNJ+lJ6DGuAbjo2AZbbl5ga6pMvTGR2bnc371dtDVO3UMEonEpajWSLOoLUZfzF1fIRfK7IW2zbnkMgk41E3EkRaz/hV+R+4R3JvFOQtYQWAzwvGppZc5GR/mRH7hadcsJiKRmaFFciYUv3p8IvkNM9vgtUMmhXqFJOdodn5BUb3svv84Fwe3Q9qoxltbzyGWyutaiSkuczOw6HgodELBMwqPEabS2n0EVhSeT+D4bV8vbMrpbczqurAWIviRC64uLYhVw6X1kg4h0mm77VGRmRfAxVijiXNYOtWfc+gbHTzVL91yG93+QqTrqT8TVE/DoThh3P2rHNhPZ7juXuGiFwZVZPxhIOGtIu/BGa9Gs0H4xe7QfuMQDJ/KOOKkYbcRih2P2z19RkWovedi9Fxm01SHQZ3cNVy2OYBJBjHgsI3SG7eo+w37FZ2T6T8T02whxOGIf/AGz19ZGeovcVi9NxCsskHmp3CxpFZMQzhPrUk9yiFoxESzDqZS6skm85m277VWM7dhGIhlgg8/TbUUkvChnyMz5kq0H8cI1dLM7wkPdxXoW0WGRNwJ9NF/tAEdmt+sXKgWTzyzlvrFfSYtau3HGaRmDjTi21pbKyknYy8ItoqnJ55Zy31ivpMXZGQzEZDLholpLrLhWWhWoyF/EXBs7XHhb1rUbEwunweoiabFxcB2tAVAcazTpKM79W8fLsxmDram3Y6KWhRWNKnVGR+64uvknTnREN/SNTWNNyOEpiPiYaWMNvNtXQtJaSO4vMxCJzgA31LU1OxeJQwvkdOCGgk73cB1LXZFUt8DmSitnDcQSvRY7fmPbLGqYJlcJwc3CgzWoojBqvow36vG9/uEKoioV09NTeUhTkK8RIfQWu2xRdZae0xckDGy6cy/OwzrMXDOFZRWuXoUR6vQYsVQdBU9MRcLcbPyQYtgZw1kmSQAjz+Ve/nB0PaqTpioI+QRmfhVY21EZLZUZ4F8xmXOXOPmf1BNJ46So+JNSCO6Gk6EJ9BfmekWBUeTqBiiW/KHeCPa80u5tn+afj6BWk1l8ZK4xcJHMKZeTsPUZc5HtLrGfBLBO7O3yvSuNxagxfCofBp3Hor7rHxT+uR610BA/YWPVp+Q9h4wP2Fj1afkPYc4dV7nF5A6kFSZY/Khj2NH1rFtipMsflQx7Gj61jOw35fsXI7dfwk/aChQAA6FeKIAACIAACILMh8pkK0w23xU8eBJJvnS2F6BWYCzNTxzWzjRbXDMZrMLLjSutmtfcDp19as/8AWfCdEv8AeluD9Z8J0S/3pbhWACx730/L0lbb4a4x/wCQfdb7Fva2nrdQzZuNbh1MEhgmsKlXPQpR3+I86Ji0wVVQD6zsnOYDM9mIjT+Y0wFoO5DLYwRtDW6Bc5V1MlXM6aU3c7eVe9RwRzGRRkEjx3WjJH+LWXxIhRTiFNrU2tJpUkzJRGVjI+YW/QlRtTqXJYfcIo9lNnEmelZF/GX59fuHhVtFQs4fVGQrpQsWrx/Buhw+cy2H1i6RdYYNtxVSgJh+rue5zDnoG382cVb6biQ0/k/g4R1MRM3ijHE6SaIrNkfXtV8BTYqrMFV5kZHYyMhfUl/c0F7O39JCoa9Ik1dHpSRERLSREWzwCFvSX9zQXs7f0kKmqHaKkZ9+/I/2lz6jHzJ/3vB+vR9RD6n378j/AGlz6jHzJ/3vB+vR9RChVcFeU1/dUX6hf0mKCF+zX91RfqF/SYoIVOVLEG3ozRVUtt/vCRqBt6N8qpb7Qn5ikKo6K2axMypaZW/3dXyFHi8Ky8lpl7Or5CjxU5Us0QAAUqtBf9MeTUr9jZ+ghQAv+mPJqV+xs/QQ1WK+Q1ei+5185m+yPWqTqkz5TzXSf2176zGtufOY2NVeU819te+sxrRso/IC4Su+cyfaPrVn5FvsMy9aj5GMLLV9slvq3PmkZuRX7DMvWo+RjCy1fbJb6tz5pGqb8/P64L0Wf/Rzez/2KQZJoxERSiIYjLHCuqQZbbGeIj+J9gjOWGVuNTVmaoSZsvoJtZ8y08/pL5GNHQtQKp+b51zEqEeIkPpLXbYousvzMXG+1L53KjQsm4qDiEXIyO5GXOR7D+QomzUlT0ltxWRhvRbRYEKHNaSMAd3knqI3HkufAFgzfJnFpeUqVRrLjRnoQ/dKi6rkRkfwHnLMmkxceI5jGw7LV9JNXWo+0iIviNj4bBa+ZcUdk8XEvR9CevdbvvZYWSmVuRlSJjTQeYg0mpSthqMjJJfEz9wn2UaMTB0hGmarKeSTKC5zUen4XP3DaSuAl8jlhQ8MlLEO0RqUpR6+dSj/ADFT5RKkKezFLMKo+AwxmTZ6s4rard/3GtaTWVIcBuC7iobHszgbqdzgZZL95FiR5mjjz61tcjEHjmcdHGWhpomy9Kjv/wBPxGXljj1svyuGZWaHGzVEXI9JGRkST+obXJHB8HpY4gy8KJeUsj6i8EviR9ohGVGL4VWEQkjumHQhpPuK5/FRi6z42tJ4D/C19WTh+ykbBudIR6Tm9QCtSnJkzPZAxGYUnnUYXUbCVqUXo/IYlGU63T7MYlJkpb76lEe0myM8Bdlz94hOSKc8GmbsoeXZqK8Nq+xwi/MvkQn9XTdMlkMRHXLOkWBkj2rPVv8AQRjDnifFIYW6OXUYTiNLX0MeJT+XEHAnkbb+8bx1qBV7UhnWUGhld2JY8k1W/iXcjV2EVu0T+qoQphTUfDJLEbjCjRbaoiun4kQoVa1OLUtajUpR3UZnpMxfFHxfDqXl8SZ3M2EpUfOpPgn8SMZNbCIGRlvD/K0OymJuxaorI5/9wXtyHk27AQFUmTzyzlvrFfSYtau3XGaSmDrLi23EtkaVJVYy8ItorenIPgGU9uDIrJainEp/w2Vb4WFpVLL1zWRxUvbcS2p9JJJSiuRaSP8AIRXPb07HHTd61XslTyjCKuBo8e7x25QPWqN43mvScb36t4+XZlMXm1NuzCLcQorKSp5RkfuuJp+rGO6Uh+7MYc6oCMlkqiI9yYMOJYRiNJIMjMZ7aqmJABHcuNl2fxyONz5GOygEnxhpx4qGDLl0wj5XFZ+CiXYZ0tB4TtfqMtR+gxYWSKEk8RAOvnCtLmLDtlLX4Rkk9KTIj1bS0cw+qyoF+YTN2Yyp5lKnjxOtOmZeFtMjIj167GKXVsfSGJ4sPOsmHZatNDHX0rszjvs3UDnfdvB3EBZlA1mqdPlLZg2hEZhNSHEFZLltZW2HbTza9Q9sq8tai6aVGYCz8ItJoVtMlKJJl6NJH7hiUFRUTJ5lxnMXmjdQk0tNtGZ2uVjMzMi2X0dYysrExbhaZODxFnotxKUp24UmSjP4EXvGu8TwtvQ6fq67Zpqjs7N76jxrOtfX/jfz5vwUqgfsLHq0/Iew8YH7Cx6tPyHsNedV2sXkDqQVJlj8qGPY0fWsW2Kkyx+VDHsaPrWM7Dfl+xcjt1/CT9oKFAADoV4ogAAIgAAIgALdaydU+ptKjVG3MiM/2pbhjz1LILZ+K3OEYFVYuXint4tr3Ntb+xVEAt/9XNPfzRveluD9XNPfzRveluGP75Q+dbv4B4r/AMe/8lUACQ1/J4ORzxMFBG6bRsJWecVc7mZ7hi0nASyYzJbE2jygWCaNROYiTdVyIi09Rn2DLErTH0nBc1Jhs0dYaN1s4Ntd1+srWQz70M+h+HdW06g7pWg7GRiayjKLGsIS3MoREVbRnEHgV7y1H8B78lqK86S79vcHJaivOku/b3C0K1g4HuK2Z2XrD9Jn32+1bEso8ow3OCjsXNZNvqGrm2UeJcbNuWwSWDP/AGjqsRl6C1fMffJaivOku/b3ByWorzpLv29wnw5nI9xUfBar+sz77faoJFxD8XEriYl1Trrh3UtR6TMTaCyiuQ0GzD8UpVmm0oxcItexWv4o9eS1FedJd+3uDktRXnSXft7hHhrOR7ipOy9YfpM++32qCxz/AAqNfiTTgzzinMN72ud7D8g3uDxbMQScWacSu17XsdxO+S1FedJd+3uDktRXnSXft7hHhkfI9xT4L1n1mffb7V5xWUZx+FdY4oSnOINF+EXtcrfyiBiwOS1FedJd+3uDktRXnSXft7hJrWHge4oNl6wfSZ99vtVfjLk8acumkNHE3nDYcJeC9r22XE15LUV50l37e4OS1FedJd+3uEeGR8j3FPgvWfWZ99vtWLOK/XMZXEwJytLZPtmjHn72vtthEJFgclqK86S79vcHJaivOku/b3CTWsPA9xQbL1g+kz77faq/AWByWorzpLv29wclqK86S79vcI8Mj5HuKfBis+sz77faq/E+lmUdyClsLBlKErJhlDWLhFsWEiK9sPUPrktRXnSXft7gKlqKv5UEfVn2y/IW5JYJ7NeCewrPoqDFsKzy00rG7t/jMO4b9Df0KETSKOOmcVGmjNnEPLdw3vhxKM7X94xhYXJaivOQvxjO4OS1FechfjGdwzgLCwXJPLpHFzjvO/T8lo6MqxVNsRLSYEonPqSq5u4bWI+o+ceNZ1KqpHoZxUGUNmEqTYnMWK9uouYSLktRXnIX4xncHJaivOQvxjO4WvB4xJ0lt62LsXrXUfgRk+K5W899bX186r0bmnakmsiX/oT5GyZ3Uy4V0H7th9ZCU8lqK85C/GM7g5LUV5yF+MZ3C49jXizhcLDp55qaQSwuLXDiLrNgsp0IpBcNlj6FbTZWSiPtsPqLynQCUHwSWRLitmdUlBfC4wOS1FechfjGdwclqK85C/GM7hie90F729K6QbaYwGZekHXlF/Vb0KN1LVc2nt24h0moa9yYa0J9+0/eNCLC5LUV5yF+MZ3ByWorzkL8YzuGWxjWCzRYLnKqpnq5DLO8uceJuseS5Qjlcphpe3J0rSw2SMXCLYj2nbDtPSIbM4tcdMYmNcKy33VOGV72ud7CdclqK85C/GM7g5LUV5yF+MZ3CiOCONxc0bysqsxWsrYmQzvu1mgta263ADgoDCvuw0S1EMLNDrSyWhRbDI7kJLX1TFP1waGCNDDTRKWn/wCUy8Ls1do3PJaivOQvxjO4OS1FechfjGdwl0TXPDzqFZhrZ4aeSmY7xH2uN/BV6JfSlcPSKUlL+L0xKUrUpKjew2I9lrHtv2jZ8lqK85C/GM7g5LUV5yF+MZ3BLEyVuV4uFNBX1OHy9NTPyuta9r7u0FR9+ps5WKKjTAEhSTI1M525KMk4ddvyEk/Wi50Kj8T/AOI8+S1FechfjGdwclqK85C/GM7hafSQvtmGm7X81n020WJ0peYpbZyXHxRvJ1Pkr0/Wi50Kj8T/AOIwZ7lBXNJREy85Ulon0Ycefvb3YRlclqK85C/GM7g5LUV5yF+MZ3CG0MDTcN9P5q9LtVi8rHRvmuCLHxRof+qhckmsbJ49MZAu5twtBkelKi5jLaQsCAynQptkUfLXkLItJsKJRH7jtb4jD5LUV5yF+MZ3ByWorzkL8YzuFU1LHNveFjYZjtfhgLaeSzTwIuPSN3YsyYZToYmjKXy15bh6jfUSSL3Fe/aQr6dTSNnEcqMj3jccPQRaiSXMRbCE15LUV5yF+MZ3DEm9O0lDy516EnxPPJthRwlpV9JEegivquENNHDvaExLHa/FAG1ElxyAsPV61acD9hY9Wn5D2HjA/YWPVp+Q9hzB1Xv0XkDqQVJlj8qGPY0fWsW2PlbbazuttCj5zK4v00/QPz2utTj2EnFqQ0wfl3g3tfTtC5xAdGZhj7lv+kgzDH3Lf9JDY++w+p6fyXEfs5d/Mf0/3LnMB0ZmGPuW/wCkgzDH3Lf9JB77D6np/JP2cu/mP6f7lzmA6MzDH3Lf9JBmGPuW/wCkg99h9T0/kn7OXfzH9P8Acucx0cz/AKpH+Eh85hj7lv8ApIegw6ur8ItutZdRs3s2cFMhMmfPbha1r+c80AAGEupVQ5X/ACrT7Kj5qEShoeIiXDbh2HXlkVzS2g1Hbn0CWZXfKwvZkfNQZI/KZ/2RX1oHUUnyLepfPm0h/etR9oqN8UzXoyN7hW4OKZr0ZG9wrcL6Fh0Vk5ls7odyq5vVzEihERpwf7WEN0jVhSZaSUWu/NsGVlWizFchcUzXoyN7hW4OKZr0ZG9wrcOqcpNCxVGuS98plCzWWTJo3YKNhvFcIrXK2mx+ER6z1+keGS+kFVxVjUgRHlAG40tzPG1nLYSva1y+YZQmYrl3ima9GRvcK3BxTNejI3uFbh1/UmTFiFpSMqSmqsgKjg4BZJjUMtG04yRnYjwmZ3Ls267GK6DKmYqheKZr0ZG9wrcHFM16Mje4VuHXdG5M3JnTpVRUk9hKakS1YWYiJTjcfP8AuIuVy0Htvo0EZDNmWSuEjpJFTeg6rhKobg044mFSybMQhPOSDMzVt5r20XMLBMxXG/FM16Mje4VuDima9GRvcK3C+hYFB5PJfUFFxdVTaq2ZFBwsbwRRuwhukZ4UGR3JRWvjtq2BlTMVyLxTNejI3uFbg4pmvRkb3Ctw6ryj0HEUg1Lo9mawk4lMzQpUJGw2hKsNrkZabHpLae3mMYWTSlVVpWELTyY4oE4hLis8bWcw4UGrxble9rawyhMxXMPFM16Mje4VuDima9GRvcK3Drqo6Jo2Vy2NehcpUHHxsMlWCETLnEKcWX8OI1GRekV+GVMyoXima9GRvcK3BxTNejI3uFbh20rIvLkvS2XuV/L4ebzKFREQsG/CKRjJZaCxYj2kZar6NQqyfSuMkk6jJRMGybioR5TLqSO5YiO2g9pcxhlCZiueOKZr0ZG9wrcHFM16Mje4VuHXWTygqfqxiCZcrqGl03i3FIRL1QK3FXIzt4WIi0kVxjZQ6Np6l2XmoGtoecTKHizhn4JEEtpTZpxEozUajLQabe8MoTMVydxTNejI3uFbg4pmvRkb3Ctw6gycUqzWM8ckpTZuXxq2FrgycaxIiHElfNmdywmZab2PUfv+qJomZ1LVrtPrPi44QnFTB95PgwiG9C1KK5aj0WvrP3hlCZiuXeKZr0ZG9wrcHFM16Mje4VuHQMxahmY+IZg4lUVDIcUlp828BuJI9CsNztfXa48BOVM6oXima9GRvcK3BxTNejI3uFbh2dC5K5JBS2VHV1dQsimc2ZS9CwhwinSSlXim4sjIk++xFp0nYVvPIApXOIuXlGQsaUO6psoiGcxtOkR+Mk9pGIyhMxXPPFM16Mje4VuDima9GRvcK3DrHJlQcNV8tnkxjqgbksJJ0NOPOrhjeI0rx6dCiMrYOvWMWtabpiTS5mIklbw0/fW7gWw1BLZNCbGeO6jO+kiK3WGVMxXLHFM16Mje4VuDima9GRvcK3Do6kZOdQVPLZIUQUOcdEoYJ00YsGI7Xtcr9osWa5GmSTNoan6zl84m0qQtyJl3B1MukSfGtdR3PZzXMivpDKEzFcWcUzXoyN7hW4OKZr0ZG9wrcL6Err2jVUxAyOZw8xKZS6cwZRDEQTObwq0YmzK56SunbtPmE5Uzrlrima9GRvcK3BxTNejI3uFbh1KVGqayYnW0bMShkvRvBIKENm6oky8ZWK+gisvYelPWNPScoOf1PLJIT5Q5x0U3Dk6aMWDEoiva5XtfVcRlTMVzlxTNejI3uFbg4pmvRkb3Ctw6QrKSnTlUzKRKiSiTgX1Mm6SMOO221zt2jJoOkZxWk8TKpO2jESc4886eFtlBa1KPm9GkwypmK5m4pmvRkb3CtwcUzXoyN7hW4dnLyc0Ebxy5nKzLVTMjw2XBqTDmrmzuLDbrufoFZzSDcl8zioB1ba3IZ5bK1NndKjSoyMyPaWgMqZiufeKZr0ZG9wrcHFM16Mje4VuHXlE5O5bO6HeqycVazIoNqNODPOQanSNWFKiO5KLXi5tgj9bySQyV6FRI6qYqFDqVG6tqFUzmjIysR4jO97n2BlTMVzHxTNejI3uFbg4pmvRkb3Ctw6cydUlH1rVDMjgHW2DUlTjrzmlLTadajLbrIiLnMtWsbyrKKpSCp+KmtOZQYCcuQbiW34Vxg4dxZmdrtYjPHtPRosR6QyhMxXI/FM16Mje4VuHw7LZiy2bjsBFNoLWpTKiIvfYX6NJXPktGf5PrSGVM630D9hY9Wn5D2HjA/YWPVp+Q9hxx1X05F5A6kAAEK4gAAIgAAIgAAIgAAIgAAIqfyueVv/50fMx+5I/KZ/2RX1oHzlb8rj9nR+Y+skflM/7Ir60DqaP5FnUvnvaT+KVH2irWF20W9TTP6Obx1WxMn5eqoTThgFIJzHmkmWlWi2gxSQlBVdbJedEcX65nw/hee/uYcGDD7739wyytAFscqNay6pIOSyWQyx6XSWSsqbhkPuY3Vmq11KP/ACloue3nsW5/RbO2VqGP/wCo/wDSKtEpyXVdyIqxufcX8YYGXGszns1fEVr4sKtXoC25L71ZdbOyGj8k7h0PAxsZLqtJJREyiXyVmTQZmbJpSRWXpUX9WuwosTCiK34ikM2pyayzjmSTJHhwpv5o2nStZ1CsKrKKxbNNi5tMPO1ztoLYAQq4P0l86TtIIg78RFJGjgcPiYv4rdeHNe6w0v6NypiWV2UlL85hNLpRWHxczgO+Lqvht12HxSGUtEFTaaVqyQQ9SyNtWKHbdcNt6H/wLIjO2k+Y9Nr20DOj8qMrlMlipVk8pNmm+GIwREaqIU9Emn+VKlaU+m522WPSHmU8bqD12UGmt56mX4eBlMogmMPi4M4rDbqtYWjk5ep1n9HecnVDMxelqp+SVJgVJJ3Fm2jTpVoto0ilRKISrsxkwjKJ4vxcJmRR3C89bDZKU4MGHT4uu+3UCArZ5Ta1lc+k8lpynJW/LpJKErzKYhwluuLWdzUq2gtu3afUQz/0Zf7Y5V6qI/5KxWokuTKquRdYwlRcA4fwdLicxns3ixINPjYTta99QW3KL71I6zm2S91qasS6k5uxNFKcS1ELjTUhLmI/CNN9V9grcWHUlb0PNJZHMweTKHl8dEpVgjCmi1m0s/4sJoIj9ArwAhXWMzldMRk6k04eho+Y1NIqfhY6DlzTyUJiG0qUZGnRdSkqI7lfanQdxzHV86iKiqeYzyKaS09GvqdU2nUi+pPuKxe4SWo8pMwj6vkVTSqFOVxcngGYRBZ7Ok5mzVcz8FOhRKMjTzbRpK/nsuqSpYidS+SlJ+E+G+wmIzqDd/iWnwU4SPXbTpvp0gApJW2yF/2t057X/wBKhrMp/wDaVVH/ABiL/wCcsY9Cz7kxV0un/BOF8CdzmZzmDHoMrYrHbXzGMap5nx3Us0nOY4Pw+Meis1jxZvOLNWG9iva9r2IOKjgsSXxcTARzEdBvLYiYdxLrTiTsaFJO5GXvF55XqmS1kzlk1lkuagJhWzZOTZ9o9KkspSk0FzEo1X9F73uKGErq6seP6Qpmn+LuDcRNOt57P48/jNOnDhLDbDznrAoCooAAJRXFJ6qo/KJLZVTVewz8vm8M2mEgZzCnoMtSUuJPrtsMtZ3TcxXVf0zFUfVsdT0W8h9yFUWF1BWJxCkkpKrbNBlo2HcT2FyoUlFcXzOocnsPHz6XttoaimYo2W3DR4qlNkWHRYtZK6rFoKvKzqGOqqp42fzHAURFrJRpR4qEkRJSkuoiIi9wgKSrO/R+dlrFBZRXpxCuxcvRCQpxDLS8C1p/bXIj2GIRW8xoGMlzLdJ07MpZFpeu65ExRupU3Y/BIrnY72O/UMvJfXkFR8tnsumNOpncJOENNutKizYIkox6NCVXvj6rWGLXFS0pOpazDyGhWKeiEPY1voj1PmtNjLBY0lbSZHfqDinBeWSD+1Gmf+JM/WQvKq3pBSbNW17SsDGzOcuxURLZgbr5YIBal2NZoIr4TMkmWvWWktI54pCccn6plk84PwngMSh/M48GPCd7YrHb02MSiR5SoqWV5O6h4sRES6duPHHyp166HW3DM8Jqw6yv42Hn0aQIQFQIW9k8h3K/ySzShkGlc2k76ZhKiUek21Ks4guojUZ+lZcwqiYOQrse+7BQy4aGW4ammVu5xTaTPQk1WLFbnsQ3OTyqoyjKrhZ9BoJ1TJKS40Z2JxCiMjSfwP0kQFQFLcv8xhoebyyiJW5il1NQiYa5f7R8yI3FH16iPrxc4jWST+1Cmf8AijH1kI7HRT8dGvxsU4p2IiHFOurVrUpR3Mz9JmM6kZvxBVEsnfB+E8Bim4jNY8GPCojtisdr212MEvvW6y0f2rVJ7e58xMclmcTkLyhLlV+M7Mk6aPGKHv4Xuw534it60nfKOq5lPeDcF4dEKezOcx4L7MViv2EMvJ/WM2oqecZys21pWjNxEO6V232z1pUXyPZ2kbgpvvUdAWsVf5NGnzmjGSiHKZ3xEhcepUMSufN2w26sJCsZnFrj5lFRziENriHluqSgrJSajMzIurSChXPQETT0J+jnHvVPLYmYy/j+xsw72bXizbdjvctArOuY2kI16FOkpLGyttKVFEJiYjOms7lYy0na2kSGhsosokdDP0nO6PRPoR2OOMM1xxskSsKUkViQZ6MOu+0R+up5T07fhV0/SbVOoaSonUIi1P54zMrHc0la1j7QUnRfmTero6iKpZnkCy3EYUKaeYWdidbVrTfZqIyPnIteoTmf0rRdZ0rNqvoNcRLIuWt8ImMoiCulCNJmps9haFGWky0WsnQQg+TqqjpGfqmC5ZCzSGfYXDRUK+RWcaX4xEdjwno12PRctolM7yj0/DUrMpBQ9HpkKZskkR0Q5FKeWpGnwE4tRaTLXaxno03BAqyGkrnyWjP8n1pG7GkrnyWjP8n1pAqBqsyDinyg2Sx/7NOwuYevCn/vPgQAOTIF19ERyvyDeU4U/wDefAg4U/8AefAgARYKvpX8ynCn/vPgQcKf+8+BAAWCdK/mU4U/958CDhT/AN58CAAsE6V/Mpwp/wC8+BBwp/7z4EABYJ0r+ZThT/3nwIOFP/efAgALBOlfzKcKf+8+BBwp/wC8+BAAWCdK/mVVWU9anKoNSzueZR+Y0MsmMbLIg4iBiFMOqSaDUki1XI7afQQAOjpvkm9S8Px03xGe/wBYrZcraj6Ve7E7g5W1H0q92J3AAv3WpsE5W1H0q92J3BytqPpV7sTuAAulgnK2o+lXuxO4OVtR9KvdidwAF0sE5W1H0q92J3BytqPpV7sTuAAulgnK2o+lXuxO4OVtR9KvdidwAF0sE5W1H0q92J3BytqPpV7sTuAAulgnK2o+lXuxO4OVtR9KvdidwAF0sE5W1H0q92J3BytqPpV7sTuAAulgnK2o+lXuxO4OVtR9KvdidwAF0sE5W1H0q92J3BytqPpV7sTuAAulgnK2o+lXuxO4OVtR9KvdidwAF0sE5W1H0q92J3BytqPpV7sTuAAulgnK2o+lXuxO4OVtR9KvdidwAF0sE5W1H0q92J3BytqPpV7sTuAAulgnK2o+lXuxO4OVtR9KvdidwAF0sE5W1H0q92J3BytqPpV7sTuAAulgnK2o+lXuxO4OVtR9KvdidwAF0sE5W1H0q92J3BytqPpV7sTuAAulgnK2o+lXuxO4OVtR9KvdidwAF0sE5W1H0q92J3BytqPpV7sTuAAulgnK2o+lXuxO4eMZUk8jIZcPEzF1xpdsSTItNjvzc5AAi6WC/9k=';

// -
// ─── NUM TO WORDS ──────────────────────────────────────────────────────────
const numToWords = n => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const two = n => n < 20 ? ones[n] : tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
  const three = n => n >= 100 ? ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + two(n % 100) : '') : two(n);
  if (!n || n === 0) return 'Zero Rupees only';
  n = Math.round(n);
  const parts = [];
  const cr = Math.floor(n / 10000000);
  n %= 10000000;
  const lakh = Math.floor(n / 100000);
  n %= 100000;
  const thou = Math.floor(n / 1000);
  n %= 1000;
  if (cr) parts.push(three(cr) + ' Crore');
  if (lakh) parts.push(three(lakh) + ' Lakh');
  if (thou) parts.push(three(thou) + ' Thousand');
  if (n) parts.push(three(n));
  return parts.join(' ') + ' Rupees only';
};

const normalizeUserRole = role => {
  const normalized = String(role || '').toLowerCase();
  if (normalized === 'admin' || normalized === 'hr') return 'hr';
  if (normalized === 'super_admin') return 'superadmin';
  if (normalized === 'superadmin') return 'superadmin';
  return 'employee';
};
// ─── PAYSLIP PREVIEW & DOWNLOAD ───────────────────────────────────────────
const PayslipModal = ({
  onClose,
  empData,
  salData,
  salSettings,
  month,
  year,
  globalReimb
}) => {
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const ss = salSettings || DEFAULT_SALARY_SETTINGS;
  const sd = salData || {
    basic: 0,
    presentDays: 0,
    month: month || 3,
    year: year || 2026,
    hra: 0,
    da: 0,
    bonus: 0,
    overtime: 0,
    incentive: 0
  };
  const reimbAmt = (globalReimb || []).filter(r => r.name === empData?.name && r.status === 'approved').reduce((a, r) => a + r.amount, 0);
  const sal = calcSalary(sd, reimbAmt, ss);
  const totalDays = sal.totalDays || 31;
  const earnings = [['Basic', sal.earnedBasic || sd.basic || 0], ...(sd.hra ? [['HRA', sd.hra]] : sd.basic ? [['HRA', 0]] : []), ...(sd.da ? [['DA', sd.da]] : []), ...(sd.bonus ? [['Bonus', sd.bonus]] : []), ...(sd.overtime ? [['Overtime', sd.overtime]] : []), ...(sd.incentive ? [['Incentive', sd.incentive]] : []), ...(reimbAmt ? [['Reimbursement', reimbAmt]] : [])].filter(([, v]) => v !== undefined);
  const deductions = [];
  const totalEarn = earnings.reduce((a, [, v]) => a + Number(v), 0);
  const totalDed = deductions.reduce((a, [, v]) => a + Number(v), 0);
  const net = totalEarn - totalDed;
  const fmt = v => Number(v).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const downloadPDF = () => {
    // Build printable HTML and use window.print
    const printContent = document.getElementById('payslip-print-area').innerHTML;
    const w = window.open('', '_blank', 'width=700,height=900');
    w.document.write(`<!DOCTYPE html><html><head><title>Payslip</title><style>
      *{margin:0;padding:0;box-sizing:border-box;}
      body{font-family:Arial,sans-serif;padding:28px 32px;color:#222;font-size:10px;}
      .ps-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;}
      .ps-right{text-align:right;}
      .ps-title{font-size:26px;font-weight:800;color:#1a1a1a;letter-spacing:-1px;}
      .ps-mo{font-size:14px;font-weight:700;color:#c0392b;margin-top:2px;}
      .ps-co{font-size:11px;font-weight:700;margin-bottom:2px;}
      .ps-addr{font-size:9px;color:#666;line-height:1.4;}
      .ps-red-line{border:none;border-top:2.5px solid #c0392b;margin:8px 0;}
      .ps-gray-line{border:none;border-top:1px solid #ddd;margin:6px 0;}
      .ps-ename{font-size:13px;font-weight:800;margin:10px 0 8px;}
      .ps-dtgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px 12px;margin-bottom:7px;}
      .ps-dt label{font-size:7.5px;color:#888;display:block;margin-bottom:2px;text-transform:uppercase;}
      .ps-dt span{font-size:9px;font-weight:600;}
      .ps-sec{font-size:8.5px;font-weight:700;color:#444;text-transform:uppercase;letter-spacing:.5px;margin:10px 0 5px;}
      .ps-days{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;background:#f8f8f8;border-radius:7px;padding:9px 12px;margin-bottom:10px;}
      .ps-day label{font-size:7.5px;color:#888;display:block;margin-bottom:2px;}
      .ps-day span{font-size:13px;font-weight:800;}
      .ps-split{display:grid;grid-template-columns:1fr 1px 1fr;gap:0 14px;}
      .ps-vline{background:#ddd;width:1px;}
      .ps-row{display:flex;justify-content:space-between;padding:2.5px 0;font-size:9px;}
      .ps-row.bold{font-weight:800;font-size:10px;border-top:1.5px solid #ddd;padding-top:4px;margin-top:4px;}
      .ps-netbox{background:#f5f5f5;border-radius:8px;padding:10px 14px;margin:12px 0 6px;}
      .ps-netrow{display:flex;justify-content:space-between;font-size:10px;padding:2px 0;}
      .ps-netrow.big{font-size:12px;font-weight:700;}
      .ps-note{font-size:7.5px;color:#888;margin:6px 0 3px;}
      .ps-footer{font-size:7.5px;color:#aaa;font-style:italic;}
      img{max-height:45px;object-fit:contain;}
    </style></head><body>${printContent}</body></html>`);
    w.document.close();
    setTimeout(() => {
      w.print();
    }, 500);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "payslip-modal",
    onClick: e => e.target === e.currentTarget && onClose()
  }, /*#__PURE__*/React.createElement("div", {
    className: "payslip-box"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 20px',
      borderBottom: '1px solid #eee',
      position: 'sticky',
      top: 0,
      background: '#fff',
      zIndex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: '#222'
    }
  }, "Pay Slip \u2014 ", MONTHS[(month || 3) - 1], " ", year || 2026), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn bs btn-sm",
    onClick: downloadPDF
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "download",
    size: 13
  }), "Download PDF"), /*#__PURE__*/React.createElement("button", {
    style: {
      width: 28,
      height: 28,
      borderRadius: 7,
      background: '#f0f0f0',
      border: '1px solid #ddd',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    onClick: onClose
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "x",
    size: 14
  })))), /*#__PURE__*/React.createElement("div", {
    id: "payslip-print-area",
    className: "ps-wrap",
    style: {
      padding: '28px 32px',
      fontFamily: "'Arial',sans-serif"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "ps-top"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("img", {
    src: CITYHOMES_LOGO,
    alt: "CityHomes",
    style: {
      height: 44,
      objectFit: 'contain',
      marginBottom: 6
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "ps-co",
    style: {
      fontSize: 11.5,
      fontWeight: 700,
      color: '#1a1a1a'
    }
  }, "CITYHOMES PROPERTY SERVICES"), /*#__PURE__*/React.createElement("div", {
    className: "ps-addr",
    style: {
      fontSize: 9.5,
      color: '#666'
    }
  }, "Mumbai, Maharashtra")), /*#__PURE__*/React.createElement("div", {
    className: "ps-right"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ps-title",
    style: {
      fontSize: 26,
      fontWeight: 800,
      color: '#1a1a1a',
      letterSpacing: -1
    }
  }, "PAYSLIP"), /*#__PURE__*/React.createElement("div", {
    className: "ps-mo",
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: '#c0392b'
    }
  }, MONTHS[(month || 3) - 1].toUpperCase(), " ", year || 2026))), /*#__PURE__*/React.createElement("div", {
    className: "ps-red-line",
    style: {
      border: 'none',
      borderTop: '2.5px solid #c0392b',
      margin: '8px 0'
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "ps-ename",
    style: {
      fontSize: 13,
      fontWeight: 800,
      color: '#1a1a1a',
      margin: '10px 0 8px'
    }
  }, (empData?.name || 'Employee').toUpperCase()), /*#__PURE__*/React.createElement("div", {
    className: "ps-gray-line",
    style: {
      border: 'none',
      borderTop: '1px solid #ddd',
      margin: '6px 0'
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "ps-dtgrid",
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      gap: '6px 12px',
      marginBottom: 7
    }
  }, [['Employee Number', `EMP-00${empData?.id || 1}`], ['Date Joined', empData?.dob || '—'], ['Department', empData?.dept || '—'], ['Sub Department', 'N/A'], ['Designation', empData?.role || '—'], ['Payment Mode', 'Bank Transfer'], ['Bank', '—'], ['Bank IFSC', '—'], ['Bank Account', '—'], ['UAN', 'No'], ['PF Number', 'N/A'], ['PAN Number', '—']].map(([label, val]) => /*#__PURE__*/React.createElement("div", {
    key: label,
    className: "ps-dt",
    style: {
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: 7.5,
      color: '#888',
      display: 'block',
      marginBottom: 2,
      textTransform: 'uppercase',
      letterSpacing: .4
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      fontWeight: 600,
      color: '#1a1a1a'
    }
  }, val)))), /*#__PURE__*/React.createElement("div", {
    className: "ps-gray-line",
    style: {
      border: 'none',
      borderTop: '1px solid #ddd',
      margin: '6px 0'
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "ps-sec",
    style: {
      fontSize: 9,
      fontWeight: 700,
      color: '#444',
      textTransform: 'uppercase',
      letterSpacing: .5,
      margin: '10px 0 5px'
    }
  }, "SALARY DETAILS"), /*#__PURE__*/React.createElement("div", {
    className: "ps-days",
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      gap: 4,
      background: '#f8f8f8',
      borderRadius: 7,
      padding: '9px 12px',
      marginBottom: 10
    }
  }, [['Actual Payable Days', `${sal.paidDays || sd.presentDays || 0}.0`], ['Total Working Days', `${totalDays}.0`], ['Loss Of Pay Days', `${sal.lopDays || 0}.00`], ['Days Payable', String(sal.paidDays || sd.presentDays || 0)]].map(([label, val]) => /*#__PURE__*/React.createElement("div", {
    key: label,
    className: "ps-day"
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: 7.5,
      color: '#888',
      display: 'block',
      marginBottom: 2
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 800,
      color: '#1a1a1a'
    }
  }, val)))), /*#__PURE__*/React.createElement("div", {
    className: "ps-gray-line",
    style: {
      border: 'none',
      borderTop: '1px solid #ddd',
      margin: '6px 0'
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "ps-split",
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1px 1fr',
      gap: '0 14px'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      fontWeight: 800,
      color: '#1a1a1a',
      marginBottom: 7
    }
  }, "EARNINGS"), earnings.map(([label, amt]) => /*#__PURE__*/React.createElement("div", {
    key: label,
    className: "ps-row",
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '2.5px 0',
      fontSize: 9
    }
  }, /*#__PURE__*/React.createElement("span", null, label), /*#__PURE__*/React.createElement("span", null, fmt(amt)))), /*#__PURE__*/React.createElement("div", {
    className: "ps-row bold",
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontWeight: 800,
      fontSize: 10,
      borderTop: '1.5px solid #ddd',
      paddingTop: 4,
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement("span", null, "Total Earnings (A)"), /*#__PURE__*/React.createElement("span", null, fmt(totalEarn)))), /*#__PURE__*/React.createElement("div", {
    className: "ps-vline",
    style: {
      background: '#ddd',
      width: 1
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      fontWeight: 800,
      color: '#1a1a1a',
      marginBottom: 7
    }
  }, "TAXES & DEDUCTIONS"), deductions.map(([label, amt]) => /*#__PURE__*/React.createElement("div", {
    key: label,
    className: "ps-row",
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '2.5px 0',
      fontSize: 9
    }
  }, /*#__PURE__*/React.createElement("span", null, label), /*#__PURE__*/React.createElement("span", null, fmt(amt)))), /*#__PURE__*/React.createElement("div", {
    className: "ps-row bold",
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontWeight: 800,
      fontSize: 10,
      borderTop: '1.5px solid #ddd',
      paddingTop: 4,
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement("span", null, "Total Taxes & Deductions (B)"), /*#__PURE__*/React.createElement("span", null, fmt(totalDed))))), /*#__PURE__*/React.createElement("div", {
    className: "ps-gray-line",
    style: {
      border: 'none',
      borderTop: '1px solid #ddd',
      margin: '10px 0 6px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "ps-note",
    style: {
      fontSize: 8,
      color: '#888',
      margin: '6px 0 3px'
    }
  }, "**Note : All amounts displayed in this payslip are in INR"), /*#__PURE__*/React.createElement("div", {
    className: "ps-netbox",
    style: {
      background: '#f5f5f5',
      borderRadius: 8,
      padding: '10px 14px',
      margin: '8px 0 6px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "ps-netrow",
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 10,
      padding: '2px 0'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Net Salary Payable ( A - B )"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700
    }
  }, fmt(net))), /*#__PURE__*/React.createElement("div", {
    className: "ps-netrow",
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 9.5,
      padding: '2px 0',
      color: '#555'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Net Salary in words"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      textAlign: 'right',
      maxWidth: 300
    }
  }, numToWords(net)))), /*#__PURE__*/React.createElement("div", {
    className: "ps-footer",
    style: {
      fontSize: 7.5,
      color: '#aaa',
      fontStyle: 'italic',
      marginTop: 8
    }
  }, "*This is computer generated statement, does not require signature."))));
};

// ─── SALARY SETTINGS PANEL ────────────────────────────────────────────────
const SalarySettingsPanel = ({
  salarySettings,
  setSalarySettings
}) => {
  const ss = salarySettings || DEFAULT_SALARY_SETTINGS;
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/salary/settings`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data) {
          setSalarySettings(prev => ({
            ...prev,
            periodType: data.period_type,
            fixedDays: data.fixed_days,
            cycleStartDay: data.cycle_start_day,
            cycleEndDay: data.cycle_end_day,
            overtimeRate: data.overtime_rate,
            holidayPolicy: data.holiday_policy
          }));
        }
      })
      .catch(e => console.error(e));
setSalarySettings  }, []);

  const set = (k, v) => setSalarySettings(s => ({
    ...s,
    [k]: v
  }));
  const days31 = Array.from({
    length: 31
  }, (_, i) => i + 1);
  const WDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const toggleWO = d => {
    const c = ss.weeklyOffDays || [];
    set('weeklyOffDays', c.includes(d) ? c.filter(x => x !== d) : [...c, d]);
  };
  const save = async () => {
    try {
      const res = await fetch(`${API_BASE}/salary/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          period_type: ss.periodType,
          fixed_days: ss.fixedDays,
          cycle_start_day: ss.cycleStartDay,
          cycle_end_day: ss.cycleEndDay,
          overtime_rate: ss.overtimeRate,
          holiday_policy: ss.holidayPolicy
        })
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (e) { alert('Save failed'); }
  };
  const previewMonth = new Date().getMonth() + 1,
    previewYear = new Date().getFullYear();
  const totalDays = ss.periodType === 'fixed' ? ss.fixedDays : getMonthDays(previewMonth, previewYear);
  const {
    weekoffs,
    paidHols
  } = countPaidOffDays(previewMonth, previewYear, ss);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "cd-h"
  }, /*#__PURE__*/React.createElement("span", {
    className: "cd-t"
  }, "Salary & Payroll Settings"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-sm",
    style: {
      background: saved ? 'var(--grn)' : 'var(--teal)',
      color: '#fff'
    },
    onClick: save
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "check",
    size: 13,
    color: "#fff"
  }), saved ? 'Saved!' : 'Save Settings')), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 17
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'rgba(0,168,132,0.05)',
      border: '1px solid rgba(0,168,132,0.15)',
      borderRadius: 9,
      padding: '10px 13px',
      marginBottom: 14,
      fontSize: 11,
      color: 'var(--t2)',
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "info",
    size: 14,
    color: "var(--teal)"
  }), "Formula: Basic \xF7 Month Days \xD7 (Present + Week Offs + Paid Holidays)"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: 'var(--t2)',
      textTransform: 'uppercase',
      letterSpacing: '.6px',
      marginBottom: 10
    }
  }, "Salary Period Type"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 9,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: `pc ${ss.periodType === 'calendar' ? 'sel' : ''}`,
    onClick: () => set('periodType', 'calendar')
  }, ss.periodType === 'calendar' && /*#__PURE__*/React.createElement("div", {
    className: "pck"
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "check",
    size: 10,
    color: "#fff"
  })), /*#__PURE__*/React.createElement("div", {
    className: "pct"
  }, "Calendar Month"), /*#__PURE__*/React.createElement("div", {
    className: "pcs"
  }, "Mar=31d, Feb=28d (actual)")), /*#__PURE__*/React.createElement("div", {
    className: `pc ${ss.periodType === 'fixed' ? 'sel' : ''}`,
    onClick: () => set('periodType', 'fixed')
  }, ss.periodType === 'fixed' && /*#__PURE__*/React.createElement("div", {
    className: "pck"
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "check",
    size: 10,
    color: "#fff"
  })), /*#__PURE__*/React.createElement("div", {
    className: "pct"
  }, "Fixed Days"), /*#__PURE__*/React.createElement("div", {
    className: "pcs"
  }, "Same days every month"))), ss.periodType === 'fixed' && /*#__PURE__*/React.createElement("div", {
    className: "fg"
  }, /*#__PURE__*/React.createElement("label", {
    className: "fl"
  }, "Fixed Working Days Per Month"), /*#__PURE__*/React.createElement("select", {
    className: "f-in f-sel",
    value: ss.fixedDays,
    onChange: e => set('fixedDays', Number(e.target.value))
  }, [26, 27, 28, 29, 30, 31].map(d => /*#__PURE__*/React.createElement("option", {
    key: d,
    value: d
  }, d, " days")))), /*#__PURE__*/React.createElement("div", {
    className: "divr"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: 'var(--t2)',
      textTransform: 'uppercase',
      letterSpacing: '.6px',
      marginBottom: 10
    }
  }, "Salary Cycle Dates"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "fg"
  }, /*#__PURE__*/React.createElement("label", {
    className: "fl"
  }, "Cycle Start Date (1-31)"), /*#__PURE__*/React.createElement("select", {
    className: "f-in f-sel",
    value: ss.cycleStart,
    onChange: e => set('cycleStart', Number(e.target.value))
  }, days31.map(d => /*#__PURE__*/React.createElement("option", {
    key: d,
    value: d
  }, d)))), /*#__PURE__*/React.createElement("div", {
    className: "fg"
  }, /*#__PURE__*/React.createElement("label", {
    className: "fl"
  }, "Cycle End Date (1-31)"), /*#__PURE__*/React.createElement("select", {
    className: "f-in f-sel",
    value: ss.cycleEnd,
    onChange: e => set('cycleEnd', Number(e.target.value))
  }, days31.map(d => /*#__PURE__*/React.createElement("option", {
    key: d,
    value: d
  }, d)))), /*#__PURE__*/React.createElement("div", {
    className: "fg"
  }, /*#__PURE__*/React.createElement("label", {
    className: "fl"
  }, "Salary Pay Day (1-31)"), /*#__PURE__*/React.createElement("select", {
    className: "f-in f-sel",
    value: ss.payDay,
    onChange: e => set('payDay', Number(e.target.value))
  }, days31.map(d => /*#__PURE__*/React.createElement("option", {
    key: d,
    value: d
  }, d)))), /*#__PURE__*/React.createElement("div", {
    className: "fg"
  }, /*#__PURE__*/React.createElement("label", {
    className: "fl"
  }, "Pay Month"), /*#__PURE__*/React.createElement("select", {
    className: "f-in f-sel",
    value: ss.payMonth,
    onChange: e => set('payMonth', e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: "same"
  }, "Same month"), /*#__PURE__*/React.createElement("option", {
    value: "next"
  }, "Next month")))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--s2)',
      borderRadius: 9,
      padding: '9px 13px',
      fontSize: 12,
      color: 'var(--t1)',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "calendar",
    size: 13,
    color: "var(--teal)"
  }), " Salary for ", /*#__PURE__*/React.createElement("b", null, ss.cycleStart, "\u2013", ss.cycleEnd), " every month \u2192 paid on ", /*#__PURE__*/React.createElement("b", null, ss.payDay, ss.payMonth === 'next' ? ' of next month' : ' of same month'), "."), /*#__PURE__*/React.createElement("div", {
    className: "divr"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: 'var(--t2)',
      textTransform: 'uppercase',
      letterSpacing: '.6px',
      marginBottom: 10
    }
  }, "Weekly Off Days (Paid)"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 7,
      marginBottom: 10
    }
  }, WDAYS.map((name, idx) => {
    const isOn = (ss.weeklyOffDays || []).includes(idx);
    return /*#__PURE__*/React.createElement("div", {
      key: idx,
      onClick: () => toggleWO(idx),
      style: {
        padding: '7px 13px',
        borderRadius: 8,
        border: `2px solid ${isOn ? 'var(--teal)' : 'var(--br2)'}`,
        background: isOn ? 'var(--td)' : 'var(--s2)',
        color: isOn ? 'var(--teal)' : 'var(--t2)',
        fontSize: 12,
        fontWeight: 700,
        cursor: 'pointer',
        transition: 'all .15s',
        display: 'flex',
        alignItems: 'center',
        gap: 5
      }
    }, isOn && /*#__PURE__*/React.createElement(Icon, {
      n: "check",
      size: 12,
      color: "var(--teal)"
    }), name.slice(0, 3));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--t2)',
      marginBottom: 14
    }
  }, "In March 2026: ", /*#__PURE__*/React.createElement("b", null, weekoffs, " weekly off days"), " counted as paid."), /*#__PURE__*/React.createElement("div", {
    className: "d-flex"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'rgba(0,168,132,0.06)',
      border: '1px solid rgba(0,168,132,0.2)',
      borderRadius: 10,
      padding: '14px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: 'var(--teal)',
      marginBottom: 10
    }
  }, "LIVE PREVIEW \u2014 March 2026 \xB7 Basic \u20B916,500"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: 8
    }
  }, [['Month Days', totalDays + 'd'], ['Weekly Offs (paid)', weekoffs + 'd'], ['Per Day Rate', '₹' + perDay], ['Paid Days (20 present)', '20+' + weekoffs + '=' + (20 + weekoffs) + 'd'], ['Net Salary', '₹' + Math.round(16500 / totalDays * (20 + weekoffs)).toLocaleString()]].map(([l, v]) => /*#__PURE__*/React.createElement("div", {
    key: l,
    style: {
      background: 'var(--s1)',
      borderRadius: 8,
      padding: '8px 10px',
      border: '1px solid var(--br)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9,
      color: 'var(--t3)',
      textTransform: 'uppercase',
      fontWeight: 700,
      marginBottom: 2
    }
  }, l), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 800,
      color: 'var(--teal)'
    }
  }, v))))), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-full",
    style: {
      background: saved ? 'var(--grn)' : 'var(--teal)',
      color: '#fff',
      marginTop: 14,
      padding: '11px',
      borderRadius: 10,
      fontSize: 13
    },
    onClick: save
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "check",
    size: 15,
    color: "#fff"
  }), saved ? 'Saved!' : 'Save Salary Settings')));
};

// ─── ATT SETTINGS PANEL ────────────────────────────────────────────────────
const AttSettingsPanel = () => {
  const [saved, setSaved] = useState(false);
  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "cd-h"
  }, /*#__PURE__*/React.createElement("span", {
    className: "cd-t"
  }, "Attendance Settings"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-sm",
    style: {
      background: saved ? 'var(--grn)' : 'var(--teal)',
      color: '#fff'
    },
    onClick: save
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "check",
    size: 13,
    color: "#fff"
  }), saved ? 'Saved!' : 'Save')), [{
    ic: 'clock',
    l: 'Shifts',
    m: 'new'
  }, {
    ic: 'clock',
    l: 'Breaks',
    m: 'new'
  }, null, {
    ic: 'eye',
    l: 'AI Face Recognition',
    m: 'dis'
  }, {
    ic: 'qr',
    l: 'QR Codes'
  }, {
    ic: 'fingerprint',
    l: 'Biometric Devices'
  }, {
    ic: 'monitor',
    l: 'Attendance Kiosk'
  }, {
    ic: 'smartphone',
    l: 'Device Verification'
  }, null, {
    ic: 'calendar',
    l: 'Leave Requests'
  }, {
    ic: 'clipboard',
    l: 'Holiday List'
  }, null, {
    ic: 'map_pin',
    l: 'Auto-Live Track',
    m: 'toggle'
  }].map((s, i) => s === null ? /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "shdr"
  }, i === 2 ? 'Attendance Modes' : i === 9 ? 'Leaves & Holidays' : 'Automation') : /*#__PURE__*/React.createElement("div", {
    key: s.l,
    className: "sr"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sic"
  }, /*#__PURE__*/React.createElement(Icon, {
    n: s.ic,
    size: 15,
    color: "var(--t2)"
  })), /*#__PURE__*/React.createElement("span", {
    className: "slb"
  }, s.l), s.m === 'new' && /*#__PURE__*/React.createElement("span", {
    className: "bg bg-new",
    style: {
      marginRight: 5,
      fontSize: 9
    }
  }, "New"), s.m === 'dis' && /*#__PURE__*/React.createElement("span", {
    className: "bg",
    style: {
      background: 'var(--s3)',
      color: 'var(--t3)',
      fontSize: 9,
      marginRight: 5
    }
  }, "Disabled"), s.m === 'toggle' ? /*#__PURE__*/React.createElement("label", {
    className: "tgl",
    style: {
      marginLeft: 'auto'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox"
  }), /*#__PURE__*/React.createElement("span", {
    className: "ts"
  })) : /*#__PURE__*/React.createElement(Icon, {
    n: "chevron_right",
    size: 13,
    color: "var(--t3)"
  }))));
};

// ─── HOLIDAY SETTINGS PANEL (shared SA + HR) ─────────────────────────────
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HolidaySettingsPanel = ({
  salarySettings,
  setSalarySettings,
  accentColor,
  yearlyHolidays: extYearlyHolidays,
  setYearlyHolidays: extSetYearlyHolidays
}) => {
  const ss = salarySettings || DEFAULT_SALARY_SETTINGS;
  const acc = accentColor || 'var(--teal)';
  const [saved, setSaved] = useState(false);
  const [selYear, setSelYear] = useState(2026);
  // Use external state if provided (from App), fallback to local
  const [localYH, setLocalYH] = useState({
    2026: {
      3: [14, 21],
      4: [14],
      5: [1]
    }
  });
  const yearlyHolidays = extYearlyHolidays || localYH;
  const setYearlyHolidaysReal = extSetYearlyHolidays || setLocalYH;

  useEffect(() => {
    fetch(`/holidays?year=${selYear}&nested=true`)
      .then(r => r.json())
      .then(data => {
        setYearlyHolidaysReal(prev => ({
          ...prev,
          [selYear]: data[selYear] || {}
        }));
      })
      .catch(err => console.error('Error loading holidays:', err));
  }, [selYear, setYearlyHolidaysReal]);

  const set = (k, v) => setSalarySettings && setSalarySettings(s => ({
    ...s,
    [k]: v
  }));
  const WDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const toggleWO = d => {
    const c = ss.weeklyOffDays || [];
    set('weeklyOffDays', c.includes(d) ? c.filter(x => x !== d) : [...c, d]);
  };
  const toggleHolDay = async (month, day) => {
    const prevHols = (yearlyHolidays[selYear] || {})[month] || [];
    const isAdding = !prevHols.includes(day);
    
    if (isAdding) {
      try {
        const response = await fetch(`${API_BASE}/holidays`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            name: 'Public Holiday',
            date: new Date(selYear, month - 1, day),
            year: selYear,
            month,
            day,
            type: ss.holidayPolicy || 'paid'
          })
        });
        if (!response.ok) throw new Error('Failed to add holiday');
      } catch (err) {
        alert('Failed to save holiday');
        return;
      }
    } else {
      try {
        const listRes = await fetch(`/holidays?year=${selYear}`);
        const holidays = await listRes.json();
        const holToDelete = holidays.find(h => h.month === month && h.day === day);
        if (holToDelete) {
          await fetch(`/holidays/${holToDelete.id}`, {
            method: 'DELETE',
            credentials: 'include'
          });
        }
      } catch (err) {
        alert('Failed to delete holiday');
        return;
      }
    }

    setYearlyHolidaysReal(y => {
      const curr = y[selYear] || {};
      const days = curr[month] || [];
      const newDays = days.includes(day) ? days.filter(x => x !== day) : [...days, day].sort((a, b) => a - b);
      return {
        ...y,
        [selYear]: {
          ...curr,
          [month]: newDays
        }
      };
    });
    
    const curr = yearlyHolidays[selYear] || {};
    const days = curr[month] || [];
    const newDays = days.includes(day) ? days.filter(x => x !== day) : [...days, day].sort((a, b) => a - b);
    set('paidHolidays', newDays);
  };
  const save = async () => {
    setSaved(true);
    const marchHols = (yearlyHolidays[selYear] || {})[3] || [];
    set('paidHolidays', marchHols);
    
    try {
      await fetch(`${API_BASE}/salary/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          holiday_policy: ss.holidayPolicy
        })
      });
    } catch (e) { console.error(e); }
    
    setTimeout(() => setSaved(false), 2000);
  };
  const totalHols = Object.values(yearlyHolidays[selYear] || {}).reduce((a, arr) => a + arr.length, 0);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "cd-h"
  }, /*#__PURE__*/React.createElement("span", {
    className: "cd-t"
  }, "Holidays & Week Off"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-sm",
    style: {
      background: saved ? 'var(--grn)' : acc,
      color: '#fff'
    },
    onClick: save
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "check",
    size: 13,
    color: "#fff"
  }), saved ? 'Saved!' : 'Save')), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 17
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: `rgba(0,168,132,0.05)`,
      border: '1px solid rgba(0,168,132,0.15)',
      borderRadius: 9,
      padding: '10px 13px',
      marginBottom: 14,
      fontSize: 11,
      color: 'var(--t2)',
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "info",
    size: 14,
    color: "var(--teal)"
  }), "Weekly offs and paid holidays are counted as paid days in salary calculation. Employees will get notified 1 day before each holiday."), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: 'var(--t1)',
      marginBottom: 10
    }
  }, "Weekly Off Days (Paid)"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 7,
      marginBottom: 10
    }
  }, WDAYS.map((name, idx) => {
    const isOn = (ss.weeklyOffDays || []).includes(idx);
    return /*#__PURE__*/React.createElement("div", {
      key: idx,
      onClick: () => toggleWO(idx),
      style: {
        padding: '8px 14px',
        borderRadius: 8,
        border: `2px solid ${isOn ? 'var(--teal)' : 'var(--br2)'}`,
        background: isOn ? 'var(--td)' : 'var(--s2)',
        color: isOn ? 'var(--teal)' : 'var(--t2)',
        fontSize: 12,
        fontWeight: 700,
        cursor: 'pointer',
        transition: 'all .15s',
        display: 'flex',
        alignItems: 'center',
        gap: 5
      }
    }, isOn && /*#__PURE__*/React.createElement(Icon, {
      n: "check",
      size: 12,
      color: "var(--teal)"
    }), name);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--t2)',
      background: 'var(--s2)',
      borderRadius: 8,
      padding: '8px 12px',
      marginBottom: 16,
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "calendar",
    size: 13,
    color: "var(--t2)"
  }), "Selected: ", /*#__PURE__*/React.createElement("b", {
    style: {
      marginLeft: 4
    }
  }, (ss.weeklyOffDays || []).map(d => WDAYS[d]).join(', ') || 'None')), /*#__PURE__*/React.createElement("div", {
    className: "divr"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: 'var(--t1)'
    }
  }, "Paid Holidays Calendar \u2014 ", selYear), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: 'var(--t2)'
    }
  }, totalHols, " holidays set"), /*#__PURE__*/React.createElement("select", {
    className: "f-in f-sel",
    style: {
      width: 'auto',
      padding: '5px 26px 5px 10px',
      fontSize: 11,
      marginBottom: 0
    },
    value: selYear,
    onChange: e => setSelYear(Number(e.target.value))
  }, [2025, 2026, 2027].map(y => /*#__PURE__*/React.createElement("option", {
    key: y,
    value: y
  }, y))), /*#__PURE__*/React.createElement("select", {
    className: "f-in f-sel",
    style: {
      width: 'auto',
      padding: '5px 26px 5px 10px',
      fontSize: 11,
      marginBottom: 0
    },
    value: ss.holidayPolicy || 'paid',
    onChange: e => set('holidayPolicy', e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: "paid"
  }, "Paid Holiday"), /*#__PURE__*/React.createElement("option", {
    value: "unpaid"
  }, "Unpaid Holiday")))), /*#__PURE__*/React.createElement("div", {
    className: "year-cal",
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      gap: 10,
      marginBottom: 14
    }
  }, MONTH_NAMES.map((mName, mIdx) => {
    const month = mIdx + 1;
    const totalDays = getMonthDays(month, selYear);
    const firstDay = new Date(selYear, mIdx, 1).getDay();
    const holDays = (yearlyHolidays[selYear] || {})[month] || [];
    const woDays = ss.weeklyOffDays || [];
    return /*#__PURE__*/React.createElement("div", {
      key: month,
      className: "month-card"
    }, /*#__PURE__*/React.createElement("div", {
      className: "month-head",
      style: {
        background: 'var(--teal)',
        padding: '6px 10px',
        fontSize: 11,
        fontWeight: 700,
        color: '#fff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("span", null, mName.slice(0, 3)), holDays.length > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        background: 'rgba(255,255,255,0.25)',
        borderRadius: 10,
        fontSize: 9,
        padding: '1px 6px'
      }
    }, holDays.length, "H")), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '4px 4px 6px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "day-hdr",
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(7,1fr)',
        marginBottom: 2
      }
    }, WDAY_SHORT.map(d => /*#__PURE__*/React.createElement("span", {
      key: d,
      style: {
        fontSize: 7,
        fontWeight: 700,
        color: 'var(--t3)',
        textAlign: 'center'
      }
    }, d[0]))), /*#__PURE__*/React.createElement("div", {
      className: "day-grid",
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(7,1fr)',
        gap: 1
      }
    }, Array.from({
      length: firstDay
    }).map((_, i) => /*#__PURE__*/React.createElement("div", {
      key: `e${i}`,
      className: "dy empty"
    })), Array.from({
      length: totalDays
    }).map((_, i) => {
      const day = i + 1;
      const dow = new Date(selYear, mIdx, day).getDay();
      const isWO = woDays.includes(dow);
      const isHol = holDays.includes(day);
      return /*#__PURE__*/React.createElement("div", {
        key: day,
        onClick: () => toggleHolDay(month, day),
        className: `dy${isHol ? ' hol' : isWO ? ' wo' : ''}`,
        title: isHol ? `${day} ${mName} — Holiday` : isWO ? `${day} ${mName} — Week Off` : ``,
        style: {
          aspectRatio: 1,
          borderRadius: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 8.5,
          fontWeight: isHol ? 800 : 600,
          cursor: 'pointer',
          transition: 'all .1s',
          background: isHol ? 'rgba(0,168,132,0.2)' : isWO ? 'rgba(37,99,235,0.1)' : 'transparent',
          color: isHol ? 'var(--teal)' : isWO ? 'var(--blu)' : 'var(--t2)',
          border: isHol ? '1px solid rgba(0,168,132,0.3)' : 'none'
        }
      }, day);
    }))));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      fontSize: 11,
      color: 'var(--t2)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 14,
      height: 14,
      borderRadius: 3,
      background: 'rgba(0,168,132,0.2)',
      border: '1px solid rgba(0,168,132,0.3)'
    }
  }), "Paid Holiday (click to toggle)"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      fontSize: 11,
      color: 'var(--t2)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 14,
      height: 14,
      borderRadius: 3,
      background: 'rgba(37,99,235,0.1)'
    }
  }), "Weekly Off (auto)")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'rgba(0,168,132,0.07)',
      borderRadius: 9,
      padding: '10px 13px',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: 'var(--teal)',
      marginBottom: 6
    }
  }, "Summary \u2014 ", selYear), Object.entries(yearlyHolidays[selYear] || {}).filter(([, days]) => days.length > 0).map(([m, days]) => /*#__PURE__*/React.createElement("div", {
    key: m,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 11,
      color: 'var(--t2)',
      padding: '2px 0'
    }
  }, /*#__PURE__*/React.createElement("span", null, MONTH_NAMES[Number(m) - 1]), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600,
      color: 'var(--teal)'
    }
  }, days.join(', '), " (", days.length, " holiday", days.length !== 1 ? 's' : '', ")"))), totalHols === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--t3)',
      textAlign: 'center',
      padding: '8px 0'
    }
  }, "No holidays set yet. Click dates above to add.")), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-full",
    style: {
      background: saved ? 'var(--grn)' : 'var(--teal)',
      color: '#fff',
      padding: '11px',
      borderRadius: 10,
      fontSize: 13
    },
    onClick: save
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "check",
    size: 15,
    color: "#fff"
  }), saved ? 'Saved!' : 'Save Holiday Settings')));
};
const Icon = ({
  n,
  size = 16,
  color = 'currentColor',
  sw = 1.8
}) => {
  const p = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: sw,
    strokeLinecap: "round",
    strokeLinejoin: "round"
  };
  const d = {
    home: /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
      d: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "9 22 9 12 15 12 15 22"
    })),
    users: /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
      d: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "9",
      cy: "7",
      r: "4"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
    })),
    calendar: /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("rect", {
      x: "3",
      y: "4",
      width: "18",
      height: "18",
      rx: "2",
      ry: "2"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "16",
      y1: "2",
      x2: "16",
      y2: "6"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "8",
      y1: "2",
      x2: "8",
      y2: "6"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "3",
      y1: "10",
      x2: "21",
      y2: "10"
    })),
    bell: /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
      d: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M13.73 21a2 2 0 01-3.46 0"
    })),
    clipboard: /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
      d: "M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"
    }), /*#__PURE__*/React.createElement("rect", {
      x: "8",
      y: "2",
      width: "8",
      height: "4",
      rx: "1",
      ry: "1"
    })),
    settings: /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "3"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
    })),
    dollar: /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "1",
      x2: "12",
      y2: "23"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"
    })),
    chart: /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("line", {
      x1: "18",
      y1: "20",
      x2: "18",
      y2: "10"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "20",
      x2: "12",
      y2: "4"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "6",
      y1: "20",
      x2: "6",
      y2: "14"
    })),
    user: /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
      d: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "7",
      r: "4"
    })),
    doc: /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
      d: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "14 2 14 8 20 8"
    })),
    logout: /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
      d: "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "16 17 21 12 16 7"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "21",
      y1: "12",
      x2: "9",
      y2: "12"
    })),
    search: /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("circle", {
      cx: "11",
      cy: "11",
      r: "8"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "21",
      y1: "21",
      x2: "16.65",
      y2: "16.65"
    })),
    download: /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
      d: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "7 10 12 15 17 10"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "15",
      x2: "12",
      y2: "3"
    })),
    plus: /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "5",
      x2: "12",
      y2: "19"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "5",
      y1: "12",
      x2: "19",
      y2: "12"
    })),
    check: /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("polyline", {
      points: "20 6 9 17 4 12"
    })),
    x: /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("line", {
      x1: "18",
      y1: "6",
      x2: "6",
      y2: "18"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "6",
      y1: "6",
      x2: "18",
      y2: "18"
    })),
    arrow_left: /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("line", {
      x1: "19",
      y1: "12",
      x2: "5",
      y2: "12"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "12 19 5 12 12 5"
    })),
    map_pin: /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
      d: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "10",
      r: "3"
    })),
    camera: /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
      d: "M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "13",
      r: "4"
    })),
    building: /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("rect", {
      x: "2",
      y: "7",
      width: "20",
      height: "14",
      rx: "2",
      ry: "2"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"
    })),
    phone: /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
      d: "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.85 19.79 19.79 0 01.1 2.18 2 2 0 012.08 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.41-.41a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"
    })),
    message: /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
      d: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
    })),
    shield: /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
      d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
    })),
    alert: /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
      d: "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "9",
      x2: "12",
      y2: "13"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "17",
      x2: "12.01",
      y2: "17"
    })),
    bank: /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("line", {
      x1: "3",
      y1: "22",
      x2: "21",
      y2: "22"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "6",
      y1: "18",
      x2: "6",
      y2: "11"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "10",
      y1: "18",
      x2: "10",
      y2: "11"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "14",
      y1: "18",
      x2: "14",
      y2: "11"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "18",
      y1: "18",
      x2: "18",
      y2: "11"
    }), /*#__PURE__*/React.createElement("polygon", {
      points: "12 2 20 7 4 7"
    })),
    trash: /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("polyline", {
      points: "3 6 5 6 21 6"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"
    })),
    edit: /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
      d: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
    })),
    crm: /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
      d: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "9",
      cy: "7",
      r: "4"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "23",
      y1: "11",
      x2: "17",
      y2: "11"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "20",
      y1: "8",
      x2: "20",
      y2: "14"
    })),
    zap: /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("polygon", {
      points: "13 2 3 14 12 14 11 22 21 10 12 10 13 2"
    })),
    gift: /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("polyline", {
      points: "20 12 20 22 4 22 4 12"
    }), /*#__PURE__*/React.createElement("rect", {
      x: "2",
      y: "7",
      width: "20",
      height: "5"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "22",
      x2: "12",
      y2: "7"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"
    })),
    announce: /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
      d: "M22 17H2a3 3 0 003-3V9a7 7 0 0114 0v5a3 3 0 003 3z"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M12 20v4"
    })),
    training: /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
      d: "M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"
    })),
    eye: /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
      d: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "3"
    })),
    clock: /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "10"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "12 6 12 12 16 14"
    })),
    lock: /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("rect", {
      x: "3",
      y: "11",
      width: "18",
      height: "11",
      rx: "2",
      ry: "2"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M7 11V7a5 5 0 0110 0v4"
    })),
    chevron_right: /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("polyline", {
      points: "9 18 15 12 9 6"
    })),
    chevron_down: /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("polyline", {
      points: "6 9 12 15 18 9"
    })),
    target: /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "10"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "6"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "2"
    })),
    send: /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("line", {
      x1: "22",
      y1: "2",
      x2: "11",
      y2: "13"
    }), /*#__PURE__*/React.createElement("polygon", {
      points: "22 2 15 22 11 13 2 9 22 2"
    })),
    refresh: /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("polyline", {
      points: "23 4 23 10 17 10"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M20.49 15a9 9 0 11-2.12-9.36L23 10"
    })),
    info: /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "10"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "16",
      x2: "12",
      y2: "12"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "8",
      x2: "12.01",
      y2: "8"
    })),
    note: /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
      d: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "14 2 14 8 20 8"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "16",
      y1: "13",
      x2: "8",
      y2: "13"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "16",
      y1: "17",
      x2: "8",
      y2: "17"
    })),
    leave: /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("rect", {
      x: "3",
      y: "4",
      width: "18",
      height: "18",
      rx: "2"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "16",
      y1: "2",
      x2: "16",
      y2: "6"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "8",
      y1: "2",
      x2: "8",
      y2: "6"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "3",
      y1: "10",
      x2: "21",
      y2: "10"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "9",
      y1: "15",
      x2: "15",
      y2: "15"
    })),
    receipt: /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
      d: "M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1V2l-2 1-2-1-2 1-2-1-2 1-2-1z"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "8",
      y1: "10",
      x2: "16",
      y2: "10"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "8",
      y1: "14",
      x2: "12",
      y2: "14"
    })),
    activity: /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("polyline", {
      points: "22 12 18 12 15 21 9 3 6 12 2 12"
    })),
    branch: /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("line", {
      x1: "6",
      y1: "3",
      x2: "6",
      y2: "15"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "18",
      cy: "6",
      r: "3"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "6",
      cy: "18",
      r: "3"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "6",
      cy: "6",
      r: "3"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M18 9a9 9 0 01-9 9"
    })),
    fingerprint: /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
      d: "M2 13.5C2 8.25 6.25 4 11.5 4S21 8.25 21 13.5"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M5 13.5c0-3.58 2.92-6.5 6.5-6.5s6.5 2.92 6.5 6.5"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M8 13.5a3.5 3.5 0 017 0"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M11.5 13.5v8"
    })),
    qr: /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("rect", {
      x: "3",
      y: "3",
      width: "7",
      height: "7"
    }), /*#__PURE__*/React.createElement("rect", {
      x: "14",
      y: "3",
      width: "7",
      height: "7"
    }), /*#__PURE__*/React.createElement("rect", {
      x: "3",
      y: "14",
      width: "7",
      height: "7"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "14",
      y1: "14",
      x2: "14.01",
      y2: "14"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "18",
      y1: "14",
      x2: "18.01",
      y2: "14"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "14",
      y1: "18",
      x2: "14.01",
      y2: "18"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "18",
      y1: "18",
      x2: "18.01",
      y2: "18"
    })),
    monitor: /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("rect", {
      x: "2",
      y: "3",
      width: "20",
      height: "14",
      rx: "2",
      ry: "2"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "8",
      y1: "21",
      x2: "16",
      y2: "21"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "17",
      x2: "12",
      y2: "21"
    })),
    smartphone: /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("rect", {
      x: "5",
      y: "2",
      width: "14",
      height: "20",
      rx: "2",
      ry: "2"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "18",
      x2: "12.01",
      y2: "18"
    }))
  };
  return d[n] || null;
};

// ─── DATA ─────────────────────────────────────────────────────────────────
const INIT_BRANCHES = [{
  id: 'all',
  name: 'All Branches',
  color: '#00A884',
  address: 'All Locations'
}, {
  id: 'b1',
  name: 'Palava Branch',
  color: '#2563EB',
  address: 'Lodha Palava, Dombivli'
}, {
  id: 'b2',
  name: 'Dombivli Branch',
  color: '#7C3AED',
  address: 'Dombivli East, Thane'
}, {
  id: 'b3',
  name: 'Kalyan Branch',
  color: '#D97706',
  address: 'Kalyan West, Maharashtra'
}];
const INIT_STAFF = [{
  id: 1,
  name: 'Aditi Patkar',
  phone: '91-8828882070',
  role: 'Accountant',
  dept: 'Accounts',
  status: 'present',
  ls: 'in',
  pt: '10:23 AM',
  loc: 'C-101, Lakeside, Lakeshore Greens',
  bank: false,
  perm: 'Attendance Manager',
  email: 'aditi@cityhomes.com',
  dob: '28 Feb 1986',
  gender: 'Female',
  marital: 'Married',
  blood: 'O+',
  guardian: 'Amit Patkar',
  emName: 'Amit',
  emRel: 'Husband',
  emPhone: '9930164787',
  branch: 'b1'
}, {
  id: 2,
  name: 'Jitendra Narendra Dhok',
  phone: '91-9876543210',
  role: 'Sales Executive',
  dept: 'Sales',
  status: 'absent',
  ls: 'nopunch',
  pt: '-',
  loc: '',
  bank: true,
  perm: 'Staff',
  email: 'jitendra@cityhomes.com',
  dob: '15 Jun 1990',
  gender: 'Male',
  marital: 'Single',
  blood: 'B+',
  branch: 'b1'
}, {
  id: 3,
  name: 'Mangal Mahendra Supekar',
  phone: '91-9123456780',
  role: 'Site Manager',
  dept: 'Operations',
  status: 'absent',
  ls: 'nopunch',
  pt: '-',
  loc: '',
  bank: true,
  perm: 'Staff',
  email: 'mangal@cityhomes.com',
  dob: '22 Aug 1985',
  gender: 'Male',
  marital: 'Married',
  blood: 'A+',
  branch: 'b2'
}, {
  id: 4,
  name: 'Rajaram Yadav',
  phone: '91-9234567890',
  role: 'Security',
  dept: 'Admin',
  status: 'present',
  ls: 'in',
  pt: '10:24 AM',
  loc: 'Dhiraj Patil - Lakeside C Wing',
  bank: true,
  perm: 'Staff',
  email: 'rajaram@cityhomes.com',
  dob: '10 Jan 1978',
  gender: 'Male',
  marital: 'Married',
  blood: 'O-',
  branch: 'b2'
}, {
  id: 5,
  name: 'Uttara Choudhari',
  phone: '91-9345678901',
  role: 'HR Executive',
  dept: 'HR',
  status: 'absent',
  ls: 'nopunch',
  pt: '-',
  loc: '',
  bank: true,
  perm: 'Staff',
  email: 'uttara@cityhomes.com',
  dob: '5 Mar 1993',
  gender: 'Female',
  marital: 'Single',
  blood: 'AB+',
  branch: 'b3'
}];
// Reset data - Start fresh from today (27th March 2026)
const CAL_DATA = {}; // Empty - will be populated as users punch in/out
const LATES = []; // No lates initially
const NOTES = [{
  text: "due to server issue on 13th and 14th can't be punch In the app.",
  date: '15 Mar 2026'
}, {
  text: 'vista me gayi thi directly for handover process',
  date: '20 Jan 2026'
}, {
  text: 'today I forgot to punch in sorry',
  date: '16 Jan 2026'
}];
const INIT_LEAVES = [{
  id: 1,
  name: 'Aditi Patkar',
  type: 'Sick Leave',
  from: '22 Mar',
  to: '23 Mar',
  days: 2,
  reason: 'Not feeling well, doctor advised rest.',
  status: 'pending'
}, {
  id: 2,
  name: 'Jitendra Narendra Dhok',
  type: 'Casual Leave',
  from: '25 Mar',
  to: '25 Mar',
  days: 1,
  reason: 'Personal work.',
  status: 'pending'
}, {
  id: 3,
  name: 'Mangal Mahendra Supekar',
  type: 'Earned Leave',
  from: '28 Mar',
  to: '30 Mar',
  days: 3,
  reason: "Sister's wedding.",
  status: 'pending'
}, {
  id: 4,
  name: 'Uttara Choudhari',
  type: 'Half Day',
  from: '21 Mar',
  to: '21 Mar',
  days: 0.5,
  reason: 'Medical appointment.',
  status: 'approved'
}, {
  id: 5,
  name: 'Rajaram Yadav',
  type: 'Casual Leave',
  from: '18 Mar',
  to: '18 Mar',
  days: 1,
  reason: 'Vehicle broke down.',
  status: 'rejected'
}];
const INIT_REIMBURSE = [{
  id: 1,
  name: 'Aditi Patkar',
  title: 'Travel to Palava site',
  amount: 850,
  date: '20 Mar',
  category: 'Travel',
  receipt: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI0YwRjJGNSIvPjxyZWN0IHg9IjQwIiB5PSIzMCIgd2lkdGg9IjMyMCIgaGVpZ2h0PSIyNDAiIHJ4PSIxMiIgZmlsbD0id2hpdGUiIHN0cm9rZT0iI0U1RTdFQiIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48dGV4dCB4PSI1OCIgeT0iNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9IjcwMCIgZmlsbD0iIzExMTgyNyI+UkVDRUlQVDwvdGV4dD48bGluZSB4MT0iNTgiIHkxPSI3MCIgeDI9IjM0MiIgeTI9IjcwIiBzdHJva2U9IiNFNUU3RUIiLz48dGV4dCB4PSI1OCIgeT0iOTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMSIgZmlsbD0iIzZCNzI4MCI+VHJhdmVsIHRvIFBhbGF2YSBzaXRlPC90ZXh0Pjx0ZXh0IHg9IjU4IiB5PSIxMTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMSIgZmlsbD0iIzZCNzI4MCI+RGF0ZTogMjAgTWFyIDIwMjY8L3RleHQ+PHRleHQgeD0iNTgiIHk9IjE2NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjIwIiBmb250LXdlaWdodD0iODAwIiBmaWxsPSIjMTZBMzRBIj7igrg4NTA8L3RleHQ+PHRleHQgeD0iNTgiIHk9IjE4NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiBmaWxsPSIjOUNBM0FGIj5UcmF2ZWwgRXhwZW5zZTwvdGV4dD48L3N2Zz4=',
  status: 'pending',
  rejReason: ''
}, {
  id: 2,
  name: 'Jitendra Narendra Dhok',
  title: 'Client lunch meeting',
  amount: 1200,
  date: '18 Mar',
  category: 'Meals',
  receipt: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI0YwRjJGNSIvPjxyZWN0IHg9IjQwIiB5PSIzMCIgd2lkdGg9IjMyMCIgaGVpZ2h0PSIyNDAiIHJ4PSIxMiIgZmlsbD0id2hpdGUiIHN0cm9rZT0iI0U1RTdFQiIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48dGV4dCB4PSI1OCIgeT0iNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9IjcwMCIgZmlsbD0iIzExMTgyNyI+UkVDRUlQVDwvdGV4dD48bGluZSB4MT0iNTgiIHkxPSI3MCIgeDI9IjM0MiIgeTI9IjcwIiBzdHJva2U9IiNFNUU3RUIiLz48dGV4dCB4PSI1OCIgeT0iOTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMSIgZmlsbD0iIzZCNzI4MCI+Q2xpZW50IGx1bmNoIG1lZXRpbmc8L3RleHQ+PHRleHQgeD0iNTgiIHk9IjExNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjExIiBmaWxsPSIjNkI3MjgwIj5EYXRlOiAxOCBNYXIgMjAyNjwvdGV4dD48dGV4dCB4PSI1OCIgeT0iMTY1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZvbnQtd2VpZ2h0PSI4MDAiIGZpbGw9IiMxNkEzNEEiPuKCuDEsMjAwPC90ZXh0Pjx0ZXh0IHg9IjU4IiB5PSIxODUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCIgZmlsbD0iIzlDQTNBRiI+TWVhbHMgRXhwZW5zZTwvdGV4dD48L3N2Zz4=',
  status: 'pending',
  rejReason: ''
}, {
  id: 3,
  name: 'Rajaram Yadav',
  title: 'Stationery purchase',
  amount: 340,
  date: '15 Mar',
  category: 'Office',
  receipt: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI0YwRjJGNSIvPjxyZWN0IHg9IjQwIiB5PSIzMCIgd2lkdGg9IjMyMCIgaGVpZ2h0PSIyNDAiIHJ4PSIxMiIgZmlsbD0id2hpdGUiIHN0cm9rZT0iI0U1RTdFQiIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48dGV4dCB4PSI1OCIgeT0iNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9IjcwMCIgZmlsbD0iIzExMTgyNyI+UkVDRUlQVDwvdGV4dD48dGV4dCB4PSI1OCIgeT0iMTY1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZvbnQtd2VpZ2h0PSI4MDAiIGZpbGw9IiMxNkEzNEEiPuKCuDM0MDwvdGV4dD48L3N2Zz4=',
  status: 'approved',
  rejReason: ''
}];

// Salary settings defaults
const DEFAULT_SALARY_SETTINGS = {
  cycleStart: 1,
  cycleEnd: 31,
  payDay: 5,
  payMonth: 'next',
  periodType: 'calendar',
  fixedDays: 30,
  weeklyOffDays: [0],
  paidHolidays: [14, 21],
  holidayPolicy: 'paid'
};
const MONTH_DAYS_MAP = {
  1: 31,
  2: 28,
  3: 31,
  4: 30,
  5: 31,
  6: 30,
  7: 31,
  8: 31,
  9: 30,
  10: 31,
  11: 30,
  12: 31
};
const getMonthDays = (m, y) => {
  if (m === 2 && (y % 4 === 0 && y % 100 !== 0 || y % 400 === 0)) return 29;
  return MONTH_DAYS_MAP[m] || 30;
};
// Count weekoffs + paid holidays in a given month
const countPaidOffDays = (month, year, settings) => {
  const totalDays = getMonthDays(month, year);
  let weekoffs = 0,
    paidHols = 0;
  for (let d = 1; d <= totalDays; d++) {
    const dayOfWeek = new Date(year, month - 1, d).getDay();
    if (settings.weeklyOffDays.includes(dayOfWeek)) weekoffs++;
  }
  if (settings.holidayPolicy === 'paid') {
    paidHols = (settings.paidHolidays || []).length;
  }
  return {
    weekoffs,
    paidHols,
    total: weekoffs + paidHols
  };
};

// Per-employee salary structure
const INIT_SALARY_DATA = {
  1: {
    basic: 16500,
    hra: 0,
    da: 0,
    bonus: 0,
    overtime: 0,
    incentive: 0,
    presentDays: 15,
    month: 3,
    year: 2026
  },
  2: {
    basic: 20000,
    hra: 0,
    da: 0,
    bonus: 0,
    overtime: 0,
    incentive: 0,
    presentDays: 20,
    month: 3,
    year: 2026
  },
  3: {
    basic: 25000,
    hra: 0,
    da: 0,
    bonus: 0,
    overtime: 0,
    incentive: 0,
    presentDays: 19,
    month: 3,
    year: 2026
  },
  4: {
    basic: 12000,
    hra: 0,
    da: 0,
    bonus: 0,
    overtime: 0,
    incentive: 0,
    presentDays: 22,
    month: 3,
    year: 2026
  },
  5: {
    basic: 18000,
    hra: 0,
    da: 0,
    bonus: 0,
    overtime: 0,
    incentive: 0,
    presentDays: 18,
    month: 3,
    year: 2026
  }
};
const INIT_ACTIVITY = [{
  id: 1,
  who: 'Aditi Patkar',
  role: 'Employee',
  action: 'marked Punch In',
  detail: '10:23 AM · C-101, Lakeside',
  when: 'Today 10:23 AM',
  type: 'punch',
  color: 'var(--grn)'
}, {
  id: 2,
  who: 'Rajaram Yadav',
  role: 'Employee',
  action: 'marked Punch In',
  detail: '10:24 AM · Lakeside C Wing',
  when: 'Today 10:24 AM',
  type: 'punch',
  color: 'var(--grn)'
}, {
  id: 3,
  who: 'Aditi Patkar',
  role: 'Employee',
  action: 'applied Sick Leave',
  detail: '22 Mar – 23 Mar, 2 days',
  when: 'Today 09:15 AM',
  type: 'leave',
  color: 'var(--amb)'
}, {
  id: 4,
  who: 'HR Manager',
  role: 'HR',
  action: 'approved leave for Uttara Choudhari',
  detail: 'Half Day · 21 Mar',
  when: 'Today 09:00 AM',
  type: 'hr',
  color: 'var(--pur)'
}, {
  id: 5,
  who: 'Jitendra Narendra Dhok',
  role: 'Employee',
  action: 'submitted Reimbursement',
  detail: 'Client lunch · ₹1,200',
  when: 'Yesterday 06:30 PM',
  type: 'reimb',
  color: 'var(--blu)'
}, {
  id: 6,
  who: 'Super Admin',
  role: 'Super Admin',
  action: 'added new branch Kalyan Branch',
  detail: 'Kalyan West, Maharashtra',
  when: 'Yesterday 03:00 PM',
  type: 'branch',
  color: 'var(--teal)'
}];
const USERS = {
  'admin@cityhomes.com': {
    pass: 'admin123',
    role: 'superadmin',
    name: 'Super Admin',
    company: 'City Homes'
  },
  'hr@cityhomes.com': {
    pass: 'hr123',
    role: 'hr',
    name: 'HR Manager',
    company: 'City Homes'
  },
  'aditi@cityhomes.com': {
    pass: 'emp123',
    role: 'employee',
    name: 'Aditi Patkar',
    empId: 1,
    company: 'City Homes'
  },
  'jitendra@cityhomes.com': {
    pass: 'emp123',
    role: 'employee',
    name: 'Jitendra Narendra Dhok',
    empId: 2,
    company: 'City Homes'
  }
};
const DEFAULT_GEO = {
  lat: 19.2183,
  lng: 73.1302,
  address: 'Lodha Palava, Dombivli, Maharashtra',
  radius: 200
};
const AC = ['#00A884', '#D97706', '#2563EB', '#7C3AED', '#E53E3E', '#0891B2', '#16A34A'];
const Av = ({
  name,
  size = 30,
  r = 8
}) => {
  const init = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const ci = name.charCodeAt(0) % AC.length;
  return /*#__PURE__*/React.createElement("div", {
    className: "av",
    style: {
      width: size,
      height: size,
      borderRadius: r,
      background: `linear-gradient(135deg,${AC[ci]},${AC[(ci + 2) % AC.length]})`,
      fontSize: size * .34,
      flexShrink: 0
    }
  }, init);
};
const THEME = {
  superadmin: {
    acc: '#00A884',
    accDim: 'rgba(0,168,132,0.08)',
    accPill: 'rgba(0,168,132,0.1)',
    accBorder: 'rgba(0,168,132,0.25)',
    logoGrad: 'linear-gradient(135deg,#00A884,#007A5E)',
    tag: 'SA',
    tagBg: 'rgba(0,168,132,0.1)',
    tagColor: '#00A884',
    logoShadow: '0 4px 12px rgba(0,168,132,0.25)'
  },
  hr: {
    acc: '#7C3AED',
    accDim: 'rgba(124,58,237,0.08)',
    accPill: 'rgba(124,58,237,0.1)',
    accBorder: 'rgba(124,58,237,0.25)',
    logoGrad: 'linear-gradient(135deg,#7C3AED,#5B21B6)',
    tag: 'HR',
    tagBg: 'rgba(124,58,237,0.1)',
    tagColor: '#7C3AED',
    logoShadow: '0 4px 12px rgba(124,58,237,0.25)'
  },
  employee: {
    acc: '#2563EB',
    accDim: 'rgba(37,99,235,0.08)',
    accPill: 'rgba(37,99,235,0.1)',
    accBorder: 'rgba(37,99,235,0.25)',
    logoGrad: 'linear-gradient(135deg,#2563EB,#1D4ED8)',
    tag: 'EMP',
    tagBg: 'rgba(37,99,235,0.1)',
    tagColor: '#2563EB',
    logoShadow: '0 4px 12px rgba(37,99,235,0.25)'
  }
};

// ─── ATTENDANCE MODAL ─────────────────────────────────────────────────────
const AttendanceModal = ({
  onClose,
  userName,
  geoSettings,
  onSuccess,
  currentStatus,
  user
}) => {
  // auto detect: if already punched in → punch out, else punch in
  const autoPunchType = currentStatus === 'in' ? 'out' : 'in';
  const [step, setStep] = useState('choose'); // Changed from 'camera' to prevent auto-start
  const [punchType, setPunchType] = useState(autoPunchType);
  const [location, setLocation] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [withinRange, setWithinRange] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [stream, setStream] = useState(null);
  const [now] = useState(new Date());
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const geo = geoSettings || DEFAULT_GEO;
  const timeStr = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  
  // FIX: Close modal handler
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };
  
  function haversine(a, b, c, d) {
    const R = 6371000,
      r = v => v * Math.PI / 180,
      dL = r(c - a),
      dg = r(d - b),
      x = Math.sin(dL / 2) ** 2 + Math.cos(r(a)) * Math.cos(r(c)) * Math.sin(dg / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  }
  const getLocation = () => {
    setLocLoading(true);
    if (!navigator.geolocation) {
      const dL = geo.lat + 0.0005,
        dg = geo.lng + 0.0003;
      setLocation({
        lat: dL,
        lng: dg,
        address: geo.address
      });
      setWithinRange(haversine(dL, dg, geo.lat, geo.lng) <= geo.radius);
      setLocLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(p => {
      const {
        latitude: lat,
        longitude: lng
      } = p.coords;
      setLocation({
        lat,
        lng,
        address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`
      });
      setWithinRange(haversine(lat, lng, geo.lat, geo.lng) <= geo.radius);
      setLocLoading(false);
    }, () => {
      const dL = geo.lat + 0.0005,
        dg = geo.lng + 0.0003;
      setLocation({
        lat: dL,
        lng: dg,
        address: geo.address + ' (approx)'
      });
      setWithinRange(haversine(dL, dg, geo.lat, geo.lng) <= geo.radius);
      setLocLoading(false);
    });
  };
  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user'
        }
      });
      setStream(s);
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = s;
      }, 100);
    } catch {
      setPhoto('demo');
    }
  };
  const capturePhoto = () => {
    if (photo === 'demo') return;
    const v = videoRef.current,
      c = canvasRef.current;
    if (v && c) {
      c.width = v.videoWidth;
      c.height = v.videoHeight;
      c.getContext('2d').drawImage(v, 0, 0);
      setPhoto(c.toDataURL('image/jpeg', 0.8));
    }
    if (stream) stream.getTracks().forEach(t => t.stop());
  };
  const handlePunch = type => {
    setPunchType(type);
    getLocation();
    startCamera();
    setStep('camera');
  };
  
  // Auto-start camera when modal is opened (component mounts)
  // This runs when parent renders <AttendanceModal /> which happens when showAttModal=true
  useEffect(() => {
    // Small delay to ensure component is ready
    const timer = setTimeout(() => {
      setStep('camera');
    }, 50);
    
    return () => clearTimeout(timer);
  }, []);
  const handleSubmit = async () => {
    console.log('[AttendanceModal] Submitting punch:', {
      type: punchType,
      location,
      photo: photo ? 'captured' : 'none',
      withinRange
    });
    
    if (!withinRange && withinRange !== null) {
      alert('You are outside the allowed geofence radius. Cannot mark attendance.');
      return;
    }
    
    if (!location) {
      alert('Location not available. Please wait for location to load.');
      return;
    }
    
    if (!photo) {
      alert('Please take a selfie first.');
      return;
    }
    
    setStep('submitting');
    
    try {
      const endpoint = punchType === 'in' ? 'punch-in' : 'punch-out';
      const response = await fetch(`/attendance/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          lat: location.lat,
          lng: location.lng,
          address: location.address,
          photoUrl: photo,
          branchId: user.branch_id || user.branch?.id || 'b1'
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        setStep('done');
        onSuccess && onSuccess(punchType, timeStr, location?.address || geo.address, result);
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed: ${errorData.message || 'Error'}`);
        setStep('camera');
      }
    } catch (error) {
      alert('Network error');
      setStep('camera');
    }
  };
  useEffect(() => () => {
    if (stream) stream.getTracks().forEach(t => t.stop());
  }, [stream]);
  const isPunchIn = punchType === 'in';
  return /*#__PURE__*/React.createElement("div", {
    className: "att-modal",
    onClick: e => e.target === e.currentTarget && handleClose()
  }, /*#__PURE__*/React.createElement("div", {
    className: "att-sheet"
  }, /*#__PURE__*/React.createElement("div", {
    className: "att-sheet-head"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: 'var(--t1)'
    }
  }, isPunchIn ? 'Punch In' : 'Punch Out'), /*#__PURE__*/React.createElement("button", {
    style: {
      width: 28,
      height: 28,
      borderRadius: 7,
      background: 'var(--s2)',
      border: '1px solid var(--br)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    onClick: handleClose
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "x",
    size: 14,
    color: "var(--t2)"
  }))), step === 'camera' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 20px 0',
      fontSize: 11,
      color: isPunchIn ? 'var(--grn)' : 'var(--red)',
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "clock",
    size: 13,
    color: isPunchIn ? 'var(--grn)' : 'var(--red)'
  }), isPunchIn ? 'PUNCH IN' : 'PUNCH OUT', " \xB7 ", timeStr), /*#__PURE__*/React.createElement("div", {
    className: "selfie-box",
    onClick: !photo ? capturePhoto : undefined
  }, !photo && !stream && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "camera",
    size: 28,
    color: "var(--t3)"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--t2)',
      fontWeight: 500
    }
  }, "Tap to take selfie")), stream && !photo && /*#__PURE__*/React.createElement("video", {
    ref: videoRef,
    autoPlay: true,
    playsInline: true,
    muted: true,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      borderRadius: 10
    },
    onClick: capturePhoto
  }), photo && photo !== 'demo' && /*#__PURE__*/React.createElement("img", {
    src: photo,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      borderRadius: 10
    },
    alt: "selfie"
  }), photo === 'demo' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8,
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      background: 'linear-gradient(135deg,#E8F5E9,#E3F2FD)'
    }
  }, /*#__PURE__*/React.createElement(Av, {
    name: userName,
    size: 56,
    r: 28
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--grn)',
      fontWeight: 600
    }
  }, "Photo captured")), /*#__PURE__*/React.createElement("canvas", {
    ref: canvasRef,
    style: {
      display: 'none'
    }
  })), photo && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 20px 6px',
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn bs",
    style: {
      flex: 1,
      fontSize: 11
    },
    onClick: () => {
      setPhoto(null);
      startCamera();
    }
  }, "Retake")), /*#__PURE__*/React.createElement("div", {
    className: "loc-box"
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "map_pin",
    size: 16,
    color: withinRange === null ? 'var(--t3)' : withinRange ? 'var(--grn)' : 'var(--red)'
  }), /*#__PURE__*/React.createElement("div", {
    className: "loc-text"
  }, locLoading ? 'Getting location...' : location ? location.address : 'Location not obtained'), withinRange === true && /*#__PURE__*/React.createElement("span", {
    className: "loc-status loc-ok"
  }, "In range"), withinRange === false && /*#__PURE__*/React.createElement("span", {
    className: "loc-status loc-fail"
  }, "Out of range")), withinRange === false && /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '0 20px 10px',
      background: 'var(--rd)',
      borderRadius: 8,
      padding: '8px 12px',
      fontSize: 11,
      color: 'var(--red)',
      fontWeight: 500,
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "alert",
    size: 13,
    color: "var(--red)"
  }), "Outside allowed radius (", geo.radius, "m). Cannot mark attendance."), /*#__PURE__*/React.createElement("div", {
    className: "submit-att"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-full",
    style: {
      background: isPunchIn ? 'var(--grn)' : 'var(--red)',
      color: '#fff',
      fontSize: 13,
      padding: '12px',
      borderRadius: 10,
      opacity: !photo || !location || withinRange === false ? 0.5 : 1
    },
    onClick: handleSubmit,
    disabled: !photo || !location || withinRange === false
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "check",
    size: 15,
    color: "#fff"
  }), isPunchIn ? 'Confirm Punch In' : 'Confirm Punch Out'))), step === 'submitting' && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '40px 20px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 48,
      height: 48,
      borderRadius: '50%',
      background: isPunchIn ? 'var(--gd)' : 'var(--rd)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 12px'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "clock",
    size: 24,
    color: isPunchIn ? 'var(--grn)' : 'var(--red)'
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: 'var(--t1)'
    }
  }, "Marking attendance...")), step === 'done' && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '36px 20px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 56,
      height: 56,
      borderRadius: '50%',
      background: isPunchIn ? 'var(--gd)' : 'var(--rd)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 14px'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "check",
    size: 28,
    color: isPunchIn ? 'var(--grn)' : 'var(--red)'
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      color: 'var(--t1)',
      marginBottom: 4
    }
  }, isPunchIn ? 'Punched In Successfully' : 'Punched Out Successfully'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--t2)',
      marginBottom: 4
    }
  }, timeStr), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--t3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "map_pin",
    size: 12,
    color: "var(--t3)"
  }), location?.address || geo.address), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-full",
    style: {
      background: isPunchIn ? 'var(--grn)' : 'var(--red)',
      color: '#fff',
      marginTop: 20,
      padding: '11px',
      borderRadius: 10
    },
    onClick: handleClose
  }, "Done"))));
};

// ─── ADD STAFF MODAL ─────────────────────────────────────────────────────
const AddStaffModal = ({
  onClose,
  onAdd,
  branches,
  accentColor,
  currentUserRole = 'hr',
  departments: initialDepartments = []
}) => {
  const genEmpId = () => 'EMP' + String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
  const [employeeId] = useState(genEmpId());
  
  const getDefaultSystemRole = () => {
    if (currentUserRole === 'superadmin') return 'superadmin';
    return 'employee';
  };

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    dateOfJoining: '',
    role: '',
    gender: 'Male',
    branch: branches?.find(b => b.id !== 'all')?.id || '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    department_id: '',
    basicSalary: '',
    systemRole: getDefaultSystemRole()
  });
  const [departments, setDepartments] = useState(initialDepartments);
  const [selectedDept, setSelectedDept] = useState(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [successData, setSuccessData] = useState(null);

  const invalidStyle = field => showValidation && !form[field] ? { border: '1px solid red' } : {};

  useEffect(() => {
    if (Array.isArray(initialDepartments) && initialDepartments.length > 0) {
      setDepartments(initialDepartments);
      return;
    }

    fetch(`${API_BASE}/departments`, {
      credentials: 'include'
    })
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        setDepartments(list);
      })
      .catch(err => {
        console.error('Failed load departments', err);
        setDepartments([]);
      });
  }, [initialDepartments]);

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleDeptChange = (deptId) => {
    updateField('department_id', deptId);
    const department = departments.find(d => String(d.id) === String(deptId));
    setSelectedDept(department || null);
  };

  const getWeekOffNames = weekOffDays => {
    const names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    if (!Array.isArray(weekOffDays)) return '-';
    return weekOffDays.map(i => names[i] || '').filter(Boolean).join(', ');
  };

  const handleAdd = async () => {
    setShowValidation(true);
    
    // Basic validation
    const requiredFields = ['fullName', 'phone', 'dateOfJoining', 'role', 'gender', 'branch', 'email', 'password', 'confirmPassword', 'dateOfBirth'];
    
    // For non-superadmin roles, basicSalary is required
    if (form.systemRole !== 'superadmin') {
      requiredFields.push('basicSalary');
    }

    if (!requiredFields.every(field => form[field])) {
      setError('Please fill all required fields.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Password and Confirm Password must match.');
      return;
    }
    setError('');

    const employeeData = {
      name: form.fullName,
      phone: form.phone,
      date_of_joining: form.dateOfJoining,
      designation: form.role,
      gender: form.gender,
      branch: form.branch,
      email: form.email,
      password: form.password,
      date_of_birth: form.dateOfBirth,
      employee_id: employeeId,
      department_id: form.systemRole === 'superadmin' ? null : form.department_id,
      basic_salary: form.systemRole === 'superadmin' ? 0 : (Number(form.basicSalary) || 0),
      role: form.systemRole || 'employee',
      week_offs: selectedDept?.week_off_days || selectedDept?.weekOffDays || [],
      holidays: selectedDept?.holidays || selectedDept?.holiday_rules || []
    };

    const result = await onAdd(employeeData);
    if (!result?.success) {
      setError(result?.message || 'Failed to add staff.');
      return;
    }

    // Show success popup with email and password
    setSuccessData({
      email: form.email,
      password: form.password,
      name: form.fullName
    });

    setTimeout(() => {
      setSuccessData(null);
      setSaved(false);
      onClose();
    }, 3000);
  };

  return (
    <div
      className="modal-ov"
      onClick={e => {
        if (!successData && e.target === e.currentTarget) {
          onClose();
        }
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        background: 'rgba(0,0,0,0.35)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {successData && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#fff',
            borderRadius: 12,
            padding: '40px 30px',
            textAlign: 'center',
            zIndex: 100001,
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            maxWidth: '420px',
            width: '90%'
          }}
        >
          <div style={{ marginBottom: 20 }}>
            <Icon n="check" size={48} color="var(--grn)" />
          </div>
          <h2 style={{ marginBottom: 10, fontSize: 20, fontWeight: 600, color: 'var(--t1)' }}>
            Successfully Created! ✨
          </h2>
          <p style={{ marginBottom: 20, fontSize: 14, color: 'var(--t2)' }}>
            User <strong>{successData.name}</strong> has been created
          </p>
          
          <div style={{ background: 'var(--s2)', borderRadius: 8, padding: 16, marginBottom: 20, textAlign: 'left' }}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, color: 'var(--t2)', fontWeight: 500, display: 'block', marginBottom: 4 }}>Email</label>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--t1)', wordBreak: 'break-all' }}>
                {successData.email}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--t2)', fontWeight: 500, display: 'block', marginBottom: 4 }}>Password</label>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--t1)', letterSpacing: '0.1em' }}>
                {successData.password}
              </div>
            </div>
          </div>

          <p style={{ fontSize: 12, color: 'var(--red)', marginTop: 16 }}>
            ⚠️ Note: Share these credentials securely with the user
          </p>
        </div>
      )}

      <div className="modal-box" style={{ position: 'relative', zIndex: 100000, margin: 'auto', width: '100%', maxWidth: '520px', display: successData ? 'none' : 'block' }}>
        <div className="modal-head">
          <span className="modal-title">Add New Staff</span>
          <button
            style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--s2)', border: '1px solid var(--br)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={onClose}
          >
            <Icon n="x" size={14} color="var(--t2)" />
          </button>
        </div>
        <div className="modal-body">
          <div className="fr" style={{ marginBottom: 8, borderBottom: '1px solid var(--br)', paddingBottom: 4 }}>
            <strong>Section 1 — Login Credentials</strong>
          </div>
          <div className="fr">
            <div className="fg">
              <label className="fl">Full Name *</label>
              <input type="text" className="f-in" value={form.fullName} onChange={e => updateField('fullName', e.target.value)} placeholder="eg. Rahul Sharma" style={invalidStyle('fullName')} />
            </div>
            <div className="fg">
              <label className="fl">Phone Number *</label>
              <input type="number" className="f-in" value={form.phone} onChange={e => updateField('phone', e.target.value)} placeholder="+91 98765 43210" style={invalidStyle('phone')} />
            </div>
          </div>
          <div className="fr">
            <div className="fg">
              <label className="fl">Date of Joining *</label>
              <input type="date" className="f-in" value={form.dateOfJoining} onChange={e => updateField('dateOfJoining', e.target.value)} style={invalidStyle('dateOfJoining')} />
            </div>
            <div className="fg">
              <label className="fl">Role / Designation *</label>
              <input type="text" className="f-in" value={form.role} onChange={e => updateField('role', e.target.value.replace(/\b\w/g, l => l.toUpperCase()))} placeholder="eg. Sales Executive" style={invalidStyle('role')} />
            </div>
          </div>
          <div className="fr">
            <div className="fg">
              <label className="fl">Gender *</label>
              <select className="f-in f-sel" value={form.gender} onChange={e => updateField('gender', e.target.value)} style={invalidStyle('gender')}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="fg">
              <label className="fl">Branch *</label>
              <select className="f-in f-sel" value={form.branch} onChange={e => updateField('branch', e.target.value)} style={invalidStyle('branch')}>
                <option value="">Select Branch</option>
                {(Array.isArray(branches) ? branches : []).map(b => <option key={b.id || b.name} value={b.id || b.name}>{b.name || ''}</option>)}
              </select>
            </div>
          </div>
          <div className="fr">
            {['superadmin', 'hr'].includes(currentUserRole) ? (
              <div className="fg">
                <label className="fl">System Role</label>
                <select className="f-in f-sel" value={form.systemRole} onChange={e => updateField('systemRole', e.target.value)} style={invalidStyle('systemRole')}>
                  {currentUserRole === 'superadmin' ? (
                    <>
                      <option value="superadmin">Super Admin</option>
                      <option value="hr">HR Manager</option>
                      <option value="employee">Employee</option>
                    </>
                  ) : (
                    <>
                      <option value="hr">HR Manager</option>
                      <option value="employee">Employee</option>
                    </>
                  )}
                </select>
              </div>
            ) : null}
            <div className="fg">
              <label className="fl">Email *</label>
              <input type="email" className="f-in" value={form.email} onChange={e => { updateField('email', e.target.value); const val = e.target.value; if (val && (!val.includes('@') || !val.includes('.'))) setEmailError('Email must contain @ and .'); else setEmailError(''); }} placeholder="rahul@cityhomes.com" style={invalidStyle('email')} />
              {emailError && <div style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{emailError}</div>}
            </div>
          </div>
          <div className="fr">
            <div className="fg">
              <label className="fl">Date of Birth *</label>
              <input type="date" className="f-in" value={form.dateOfBirth} onChange={e => updateField('dateOfBirth', e.target.value)} style={invalidStyle('dateOfBirth')} />
            </div>
            <div className="fg">
              <label className="fl">Employee ID</label>
              <input type="text" className="f-in" value={employeeId} readOnly style={{ background: 'var(--bg)', cursor: 'not-allowed' }} />
            </div>
          </div>
          <div className="fr">
            {form.systemRole !== 'superadmin' ? (
              <>
                <div className="fg">
                  <label className="fl">Basic Salary *</label>
                  <input type="number" className="f-in" value={form.basicSalary} onChange={e => updateField('basicSalary', e.target.value)} placeholder="e.g. 30000" style={invalidStyle('basicSalary')} />
                </div>
                <div className="fg">
                  <label className="fl">Department</label>
                  <select className="f-in f-sel" value={form.department_id} onChange={e => handleDeptChange(e.target.value)}>
                    <option value="">Select Department</option>
                    {(Array.isArray(departments) ? departments : []).map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
                  </select>
                </div>
              </>
            ) : null}
          </div>
          <div className="fr">
            <div className="fg" style={{ position: 'relative' }}>
              <label className="fl">Password *</label>
              <input type={showPassword ? "text" : "password"} className="f-in" value={form.password} onChange={e => updateField('password', e.target.value)} style={{ ...invalidStyle('password'), paddingRight: 36 }} />
              <Icon n={showPassword ? "eye-off" : "eye"} size={16} color="var(--t2)" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', zIndex: 2 }} onClick={() => setShowPassword(!showPassword)} />
            </div>
            <div className="fg" style={{ position: 'relative' }}>
              <label className="fl">Confirm Password *</label>
              <input type={showConfirmPassword ? "text" : "password"} className="f-in" value={form.confirmPassword} onChange={e => updateField('confirmPassword', e.target.value)} style={{ ...invalidStyle('confirmPassword'), paddingRight: 36 }} />
              <Icon n={showConfirmPassword ? "eye-off" : "eye"} size={16} color="var(--t2)" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', zIndex: 2 }} onClick={() => setShowConfirmPassword(!showConfirmPassword)} />
            </div>
          </div>
          {error && <div style={{ marginTop: 8, color: 'var(--red)', fontSize: 12 }}>{error}</div>}
          {selectedDept && (
            <div className="cd" style={{ marginTop: 12, padding: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--t2)' }}>
                ℹ️ Week Off: {getWeekOffNames(selectedDept.week_off_days || selectedDept.weekOffDays || [])}
              </div>
            </div>
          )}
        </div>
        <div className="modal-foot">
          <button className="btn bs btn-full" onClick={onClose}>Cancel</button>
          <button className="btn btn-full" style={{ background: accentColor, color: '#fff' }} onClick={handleAdd}>
            <Icon n="plus" size={14} color="#fff" /> Add Staff
          </button>
        </div>
      </div>
    </div>
  );
};
// ─── ADD BRANCH MODAL ────────────────────────────────────────────────────
const AddBranchModal = ({
  onClose,
  onAdd
}) => {
  const COLORS = ['#00A884', '#2563EB', '#7C3AED', '#D97706', '#E53E3E', '#0891B2', '#16A34A'];
  const [form, setForm] = useState({
    name: '',
    address: '',
    city: '',
    color: COLORS[1],
    lat: '',
    lng: '',
    radius: 200
  });
  const set = (k, v) => setForm(f => ({
    ...f,
    [k]: v
  }));
  const [saved, setSaved] = useState(false);
  const handleAdd = () => {
    if (!form.name || !form.address) {
      alert('Name and Address required');
      return;
    }
    onAdd({
      ...form,
      id: 'b' + Date.now(),
      staffCount: 0
    });
    setSaved(true);
    setTimeout(onClose, 1200);
  };
  const radii = [100, 200, 300, 500, 1000];
  return /*#__PURE__*/React.createElement("div", {
    className: "modal-ov",
    onClick: e => e.target === e.currentTarget && onClose()
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-box"
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "modal-title"
  }, "Add New Branch"), /*#__PURE__*/React.createElement("button", {
    style: {
      width: 28,
      height: 28,
      borderRadius: 7,
      background: 'var(--s2)',
      border: '1px solid var(--br)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    onClick: onClose
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "x",
    size: 14,
    color: "var(--t2)"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "modal-body"
  }, saved && /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--gd)',
      border: '1px solid rgba(22,163,74,0.2)',
      borderRadius: 8,
      padding: '9px 12px',
      marginBottom: 12,
      fontSize: 12,
      color: 'var(--grn)',
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "check",
    size: 13,
    color: "var(--grn)"
  }), "Branch added successfully!"), /*#__PURE__*/React.createElement("div", {
    className: "fg"
  }, /*#__PURE__*/React.createElement("label", {
    className: "fl"
  }, "Branch Name *"), /*#__PURE__*/React.createElement("input", {
    className: "f-in",
    value: form.name,
    onChange: e => set('name', e.target.value),
    placeholder: "eg. Thane Branch"
  })), /*#__PURE__*/React.createElement("div", {
    className: "fg"
  }, /*#__PURE__*/React.createElement("label", {
    className: "fl"
  }, "Full Address *"), /*#__PURE__*/React.createElement("input", {
    className: "f-in",
    value: form.address,
    onChange: e => set('address', e.target.value),
    placeholder: "eg. Shop 12, Main Road, Thane West"
  })), /*#__PURE__*/React.createElement("div", {
    className: "fr"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fg"
  }, /*#__PURE__*/React.createElement("label", {
    className: "fl"
  }, "City"), /*#__PURE__*/React.createElement("input", {
    className: "f-in",
    value: form.city,
    onChange: e => set('city', e.target.value),
    placeholder: "Thane"
  })), /*#__PURE__*/React.createElement("div", {
    className: "fg"
  }, /*#__PURE__*/React.createElement("label", {
    className: "fl"
  }, "Geofence Radius"), /*#__PURE__*/React.createElement("select", {
    className: "f-in f-sel",
    value: form.radius,
    onChange: e => set('radius', Number(e.target.value))
  }, radii.map(r => /*#__PURE__*/React.createElement("option", {
    key: r,
    value: r
  }, r, "m"))))), /*#__PURE__*/React.createElement("div", {
    className: "fr"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fg"
  }, /*#__PURE__*/React.createElement("label", {
    className: "fl"
  }, "Latitude"), /*#__PURE__*/React.createElement("input", {
    className: "f-in",
    value: form.lat,
    onChange: e => set('lat', e.target.value),
    placeholder: "19.2183"
  })), /*#__PURE__*/React.createElement("div", {
    className: "fg"
  }, /*#__PURE__*/React.createElement("label", {
    className: "fl"
  }, "Longitude"), /*#__PURE__*/React.createElement("input", {
    className: "f-in",
    value: form.lng,
    onChange: e => set('lng', e.target.value),
    placeholder: "73.1302"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "fg"
  }, /*#__PURE__*/React.createElement("label", {
    className: "fl"
  }, "Branch Color"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
      marginTop: 4
    }
  }, COLORS.map(c => /*#__PURE__*/React.createElement("div", {
    key: c,
    onClick: () => set('color', c),
    style: {
      width: 28,
      height: 28,
      borderRadius: '50%',
      background: c,
      cursor: 'pointer',
      border: form.color === c ? '3px solid var(--t1)' : '3px solid transparent',
      transition: 'all .15s'
    }
  }))))), /*#__PURE__*/React.createElement("div", {
    className: "modal-foot"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn bs btn-full",
    onClick: onClose
  }, "Cancel"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-full",
    style: {
      background: 'var(--teal)',
      color: '#fff'
    },
    onClick: handleAdd
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "plus",
    size: 14,
    color: "#fff"
  }), "Add Branch"))));
};

// ─── PERSONAL FORM ───────────────────────────────────────────────────────
const PersonalForm = ({
  emp,
  onBack,
  accentColor
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    animation: 'fi .2s ease'
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "bk",
  onClick: onBack
}, /*#__PURE__*/React.createElement(Icon, {
  n: "arrow_left",
  size: 18,
  color: "var(--t2)"
}), /*#__PURE__*/React.createElement("span", {
  className: "bkl"
}, "Back")), /*#__PURE__*/React.createElement("div", {
  className: "cd"
}, /*#__PURE__*/React.createElement("div", {
  className: "cd-h"
}, /*#__PURE__*/React.createElement("span", {
  className: "cd-t"
}, "Personal Details"), /*#__PURE__*/React.createElement("button", {
  className: "btn btn-sm",
  style: {
    background: accentColor,
    color: '#fff'
  }
}, /*#__PURE__*/React.createElement(Icon, {
  n: "doc",
  size: 13,
  color: "#fff"
}), "Biodata")), /*#__PURE__*/React.createElement("div", {
  style: {
    padding: 18
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "fg"
}, /*#__PURE__*/React.createElement("label", {
  className: "fl"
}, "Staff Name"), /*#__PURE__*/React.createElement("input", {
  className: "f-in",
  defaultValue: emp.name
})), /*#__PURE__*/React.createElement("div", {
  className: "fg"
}, /*#__PURE__*/React.createElement("label", {
  className: "fl"
}, "Mobile Number"), /*#__PURE__*/React.createElement("div", {
  className: "ph-row"
}, /*#__PURE__*/React.createElement("select", {
  className: "ph-code f-sel"
}, /*#__PURE__*/React.createElement("option", null, "+91")), /*#__PURE__*/React.createElement("input", {
  className: "f-in",
  style: {
    flex: 1
  },
  defaultValue: emp.phone?.replace('91-', '') || ''
}))), /*#__PURE__*/React.createElement("div", {
  className: "fg"
}, /*#__PURE__*/React.createElement("label", {
  className: "fl"
}, "Personal Email"), /*#__PURE__*/React.createElement("input", {
  className: "f-in",
  defaultValue: emp.email || ''
})), /*#__PURE__*/React.createElement("div", {
  className: "fg"
}, /*#__PURE__*/React.createElement("label", {
  className: "fl"
}, "Date Of Birth"), /*#__PURE__*/React.createElement("input", {
  className: "f-in",
  type: "date"
})), /*#__PURE__*/React.createElement("div", {
  className: "fg"
}, /*#__PURE__*/React.createElement("label", {
  className: "fl"
}, "Gender"), /*#__PURE__*/React.createElement("select", {
  className: "f-in f-sel"
}, /*#__PURE__*/React.createElement("option", null, emp.gender || 'Select'), /*#__PURE__*/React.createElement("option", null, "Male"), /*#__PURE__*/React.createElement("option", null, "Female"), /*#__PURE__*/React.createElement("option", null, "Other"))), /*#__PURE__*/React.createElement("div", {
  className: "fg"
}, /*#__PURE__*/React.createElement("label", {
  className: "fl"
}, "Marital Status"), /*#__PURE__*/React.createElement("select", {
  className: "f-in f-sel"
}, /*#__PURE__*/React.createElement("option", null, emp.marital || 'Select'), /*#__PURE__*/React.createElement("option", null, "Single"), /*#__PURE__*/React.createElement("option", null, "Married"), /*#__PURE__*/React.createElement("option", null, "Divorced"))), /*#__PURE__*/React.createElement("div", {
  className: "fg"
}, /*#__PURE__*/React.createElement("label", {
  className: "fl"
}, "Blood Group"), /*#__PURE__*/React.createElement("select", {
  className: "f-in f-sel"
}, /*#__PURE__*/React.createElement("option", null, emp.blood || 'Select'), /*#__PURE__*/React.createElement("option", null, "A+"), /*#__PURE__*/React.createElement("option", null, "A-"), /*#__PURE__*/React.createElement("option", null, "B+"), /*#__PURE__*/React.createElement("option", null, "B-"), /*#__PURE__*/React.createElement("option", null, "O+"), /*#__PURE__*/React.createElement("option", null, "O-"), /*#__PURE__*/React.createElement("option", null, "AB+"), /*#__PURE__*/React.createElement("option", null, "AB-"))), /*#__PURE__*/React.createElement("div", {
  className: "divr"
}), /*#__PURE__*/React.createElement("div", {
  className: "fg"
}, /*#__PURE__*/React.createElement("label", {
  className: "fl"
}, "Emergency Contact Name"), /*#__PURE__*/React.createElement("input", {
  className: "f-in",
  defaultValue: emp.emName || ''
})), /*#__PURE__*/React.createElement("div", {
  className: "fg"
}, /*#__PURE__*/React.createElement("label", {
  className: "fl"
}, "Emergency Contact Mobile"), /*#__PURE__*/React.createElement("div", {
  className: "ph-row"
}, /*#__PURE__*/React.createElement("select", {
  className: "ph-code f-sel"
}, /*#__PURE__*/React.createElement("option", null, "+91")), /*#__PURE__*/React.createElement("input", {
  className: "f-in",
  style: {
    flex: 1
  },
  defaultValue: emp.emPhone || ''
}))), /*#__PURE__*/React.createElement("button", {
  className: "btn btn-full",
  style: {
    background: accentColor,
    color: '#fff',
    marginTop: 4
  }
}, /*#__PURE__*/React.createElement(Icon, {
  n: "check",
  size: 14,
  color: "#fff"
}), "Save Details"))));

// ─── EMP DETAIL ───────────────────────────────────────────────────────────
const EmpDetail = ({
  emp,
  onBack,
  accentColor,
  userRole,
  salaryData,
  salarySettings,
  globalReimb,
  yearlyHolidays,
  setSalaryData,
  setGlobalActivity
}) => {
  const [tab, setTab] = useState('att');
  const [subPage, setSubPage] = useState(null);
  const [showPayslipDet, setShowPayslipDet] = useState(false);
  const [payslipMonth, setPayslipMonth] = useState(new Date().getMonth() + 1);
  const [attendanceMonth, setAttendanceMonth] = useState(new Date().getMonth() + 1);
  const [attendanceYear, setAttendanceYear] = useState(new Date().getFullYear());
  const [editDayModal, setEditDayModal] = useState(null); // {day, dayNum, currentStatus, punchIn, punchOut, note}
  const [loading, setLoading] = useState(true);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState({
    present: 0,
    halfDay: 0,
    absent: 0,
    weekOff: 0,
    holiday: 0,
    leave: 0
  });
  
  // Show attendance tab by default and reset scroll when employee detail opens or employee changes
  useEffect(() => {
    setTab('att');
    setSubPage(null);
    setPayslipMonth(new Date().getMonth() + 1);
    setAttendanceMonth(new Date().getMonth() + 1);
    setAttendanceYear(new Date().getFullYear());
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        behavior: 'auto'
      });
      document.querySelector('.main')?.scrollTo({
        top: 0,
        behavior: 'auto'
      });
    }
  }, [emp?.id]);
  const [currentStatus, setCurrentStatus] = useState(null);
  const clsMap = {
    p: 'dp',
    a: 'da',
    h: 'dh',
    w: 'dw'
  };
  const isReadOnly = userRole === 'employee';
  // Per-employee attendance overrides stored locally
  const [attOverrides, setAttOverrides] = useState({}); // {dayNum: 'p'|'a'|'h'|'w'|'hol'|'pl'|'hdl'|'ul'}
  const [punchData, setPunchData] = useState({}); // {dayNum: {punchIn, punchOut, note}}
  const mapStatus = useCallback(status => {
    switch (status) {
      case 'present':
        return 'p';
      case 'half_day':
        return 'h';
      case 'holiday':
        return 'hol';
      case 'week_off':
        return 'w';
      case 'paid_leave':
        return 'pl';
      case 'unpaid_leave':
        return 'ul';
      case 'future':
        return 'f';
      case 'absent':
      case 'absent_pending':
      default:
        return 'a';
    }
  }, []);
  const fmtTime = useCallback(value => value ? new Date(value).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  }) : null, []);
  const fetchAttendance = useCallback(async () => {
    if (!emp?.id) return;
    try {
      setLoading(true);
      const historyRes = await fetch(`/attendance/employee/${emp.id}?month=${attendanceMonth}&year=${attendanceYear}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        const days = historyData.days || [];
        setAttendanceHistory(days);
        setAttendanceSummary(historyData.summary || {
          present: 0,
          halfDay: 0,
          absent: 0,
          weekOff: 0,
          holiday: 0,
          leave: 0
        });
        const processedPunchData = {};
        const processedOverrides = {};
        days.forEach(record => {
          const key = String(record.day);
          processedOverrides[record.day] = mapStatus(record.status);
          processedPunchData[key] = {
            id: record.id,
            punchIn: fmtTime(record.punchIn),
            punchOut: fmtTime(record.punchOut),
            note: record.note || '',
            status: record.status,
            isLate: !!record.isLate
          };
        });
        setAttOverrides(processedOverrides);
        setPunchData(processedPunchData);
      } else {
        setAttendanceHistory([]);
        setAttendanceSummary({
          present: 0,
          halfDay: 0,
          absent: 0,
          weekOff: 0,
          holiday: 0,
          leave: 0
        });
        setAttOverrides({});
        setPunchData({});
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  }, [attendanceMonth, attendanceYear, emp?.id, fmtTime, mapStatus]);
  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);
  const saveAttendanceForDay = async (dayNum, statusCode, extra = {}) => {
    if (!emp?.id) return null;
    const normalizedStatus = statusCode === 'hdl' ? 'h' : statusCode;
    const statusMap = {
      p: 'present',
      a: 'absent',
      h: 'half_day',
      w: 'week_off',
      hol: 'holiday',
      pl: 'paid_leave',
      ul: 'unpaid_leave'
    };
    const toIsoString = timeValue => {
      if (!timeValue) return null;
      const [timePart, meridiem] = String(timeValue).trim().split(' ');
      if (!timePart || !meridiem) return null;
      let [hours, minutes] = timePart.split(':').map(Number);
      if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
      const upperMeridiem = meridiem.toUpperCase();
      if (upperMeridiem === 'PM' && hours !== 12) hours += 12;
      if (upperMeridiem === 'AM' && hours === 12) hours = 0;
      return new Date(attendanceYear, attendanceMonth - 1, dayNum, hours, minutes, 0, 0).toISOString();
    };
    const punchInTime = extra.punchIn !== undefined ? toIsoString(extra.punchIn) : undefined;
    const punchOutTime = extra.punchOut !== undefined ? toIsoString(extra.punchOut) : undefined;
    const dateKey = `${attendanceYear}-${String(attendanceMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const body = {
      status: statusMap[normalizedStatus] || 'absent',
      note: extra.note || '',
      editReason: extra.editReason || 'Attendance updated from calendar'
    };
    if (extra.punchIn !== undefined) body.punchInTime = punchInTime;
    if (extra.punchOut !== undefined) body.punchOutTime = punchOutTime;
    const response = await fetch(`/attendance/employee/${emp.id}/date/${dateKey}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Failed to save attendance');
    }
    return response.json();
  };
  const handleMarkAllPresent = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const nextOverrides = {
        ...attOverrides
      };
      const requests = [];
      for (let d = 1; d <= new Date(attendanceYear, attendanceMonth, 0).getDate(); d++) {
        const currentStatus = attOverrides[d];
        const currentDate = new Date(attendanceYear, attendanceMonth - 1, d);
        if (currentDate > today) continue;
        if (['hol', 'w', 'pl', 'ul'].includes(currentStatus)) continue;
        nextOverrides[d] = 'p';
        requests.push(saveAttendanceForDay(d, 'p', {
          editReason: `Bulk marked present for ${emp.name || 'employee'}`
        }));
      }
      await Promise.all(requests);
      setAttOverrides(nextOverrides);
      setSalaryData && setSalaryData(prev => ({
        ...prev,
        [emp.id]: {
          ...(prev[emp.id] || {}),
          presentDays: Object.values(nextOverrides).filter(status => status === 'p' || status === 'pl').length
        }
      }));
      await fetchAttendance();
    } catch (error) {
      console.error('Error marking all attendance as present:', error);
      alert('Failed to mark all present. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const [empSalary, setEmpSalary] = useState(null);
  const [salLoading, setSalLoading] = useState(false);

  // Fetch employee salary structure
  useEffect(() => {
    if (tab === 'sal' && emp?.id) {
      setSalLoading(true);
      fetch(`/employees/${emp.id}/salary`, { credentials: 'include' })
        .then(r => r.json())
        .then(data => {
          if (data) {
            setEmpSalary({
              basic: Number(data.basic) || 0,
              hra: Number(data.hra) || 0,
              da: Number(data.da) || 0,
              bonus: Number(data.bonus) || 0,
              overtime: Number(data.overtime) || 0,
              incentive: Number(data.incentive) || 0
            });
          }
        })
        .catch(e => console.error(e))
        .finally(() => setSalLoading(false));
    }
  }, [tab, emp?.id]);

  const sd = empSalary || {
    basic: 0,
    presentDays: 0,
    month: 3,
    year: 2026
  };
  const empReimb = (globalReimb || []).filter(r => r.name === emp?.name && r.status === 'approved').reduce((a, r) => a + r.amount, 0);
  const empSalCalc = calcSalary(sd, empReimb, salarySettings || DEFAULT_SALARY_SETTINGS);
  const monthDate = new Date(attendanceYear, attendanceMonth - 1, 1);
  const monthLabel = monthDate.toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric'
  });
  const monthDateLabel = monthDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  const contactNumber = (emp?.phone || '').toString().replace(/\D/g, '');
  const phoneWithCode = contactNumber ? contactNumber.startsWith('91') ? `+${contactNumber}` : `+91${contactNumber}` : '';
  const openEmployeeAction = action => {
    if (typeof window === 'undefined') return;
    if ((action === 'call' || action === 'text') && !phoneWithCode) {
      alert('Employee phone number is not available.');
      return;
    }
    if (action === 'call') {
      window.location.href = `tel:${phoneWithCode}`;
      return;
    }
    if (action === 'text') {
      const message = encodeURIComponent(`Hello ${emp?.name || 'Employee'}, City Homes.`);
      window.location.href = `sms:${phoneWithCode}?body=${message}`;
      return;
    }
    if (action === 'location') {
      const locationText = encodeURIComponent(emp?.loc || emp?.branch || 'City Homes office');
      window.open(`https://www.google.com/maps/search/?api=1&query=${locationText}`, '_blank');
      return;
    }
    alert(`${emp?.name || 'Employee'} CRM profile will be available soon.`);
  };
  const downloadAttendanceReport = () => {
    const rows = (attendanceHistory || []).map(day => [day.date, day.status, day.punchIn || '', day.punchOut || '', day.workingHours || '']);
    const csv = [['Date', 'Status', 'Punch In', 'Punch Out', 'Working Hours'], ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(emp?.name || 'employee').replace(/\s+/g, '-').toLowerCase()}-${attendanceMonth}-${attendanceYear}-attendance.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };
  const changeVisibleMonth = delta => {
    const nextDate = new Date(attendanceYear, attendanceMonth - 1 + delta, 1);
    setAttendanceYear(nextDate.getFullYear());
    setAttendanceMonth(nextDate.getMonth() + 1);
    setPayslipMonth(nextDate.getMonth() + 1);
  };
  const MONTHS_SH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const getStatus = dayNum => {
    if (attOverrides[dayNum]) return attOverrides[dayNum];
    const historyDay = (attendanceHistory || []).find(day => Number(day.day) === Number(dayNum));
    if (historyDay?.status) return mapStatus(historyDay.status);

    const holidaySource = (yearlyHolidays && yearlyHolidays[attendanceYear] && yearlyHolidays[attendanceYear][attendanceMonth]) || salarySettings?.paidHolidays || DEFAULT_SALARY_SETTINGS.paidHolidays || [];
    const dateKey = `${attendanceYear}-${String(attendanceMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const isHol = Array.isArray(holidaySource)
      ? holidaySource.includes(dateKey) || holidaySource.includes(dayNum)
      : !!holidaySource[dateKey] || !!holidaySource[dayNum];

    if (isHol) return 'hol';
    return new Date(attendanceYear, attendanceMonth - 1, dayNum) > new Date() ? 'f' : 'a';
  };
  const firstDayOffset = new Date(attendanceYear, attendanceMonth - 1, 1).getDay();
  const totalDaysInMonth = new Date(attendanceYear, attendanceMonth, 0).getDate();
  const counts = {
    p: 0,
    a: 0,
    hol: 0,
    h: 0,
    pl: 0,
    w: 0,
    ul: 0
  };
  for (let i = 1; i <= totalDaysInMonth; i++) {
    const s = getStatus(i);
    if (s === 'p') counts.p++;else if (s === 'a' || s === 'ul') counts.a++;else if (s === 'hol') counts.hol++;else if (s === 'h' || s === 'hdl') counts.h++;else if (s === 'pl') counts.pl++;else if (s === 'w') counts.w++;
  }
  const statCls = {
    p: 'dp',
    a: 'da',
    h: 'dh',
    w: 'dw',
    hol: 'dhol',
    pl: 'dpl',
    hdl: 'dh',
    ul: 'da',
    f: 'df'
  };

  const empDetailNavigation = [{
    ic: 'user',
    l: 'Personal Details',
    key: 'personal'
  }, {
    ic: 'building',
    l: 'Current Employment',
    key: 'current'
  }, {
    ic: 'clipboard',
    l: 'Custom Details',
    key: 'custom',
    m: 'new'
  }, {
    ic: 'shield',
    l: 'Background Verification',
    key: 'background'
  }, {
    ic: 'calendar',
    l: 'Attendance Details',
    key: 'attendance'
  }, {
    ic: 'dollar',
    l: 'Salary Details',
    key: 'salary'
  }, {
    ic: 'bank',
    l: 'Bank Details',
    key: 'bank',
    m: emp.bank ? undefined : 'nv'
  }, {
    ic: 'bell',
    l: 'Notifications',
    key: 'notifications',
    m: 'toggle'
  }, {
    ic: 'note',
    l: 'Requests',
    key: 'requests'
  }];
  const detailSectionList = <div className="cd" style={{
    margin: '12px 14px 14px'
  }}>{empDetailNavigation.map(item => <div key={item.key} className="sr" onClick={() => {
      if (item.key === 'attendance') {
        setTab('att');
        setSubPage(null);
      } else if (item.key === 'salary') {
        setTab('sal');
        setSubPage(null);
      } else {
        setSubPage(item.key);
      }
    }}><div className="sic"><Icon n={item.ic} size={15} color="var(--t2)" /></div><span className="slb">{item.l}</span>{item.m === 'new' && <span className="bg bg-new" style={{
        marginRight: 5,
        fontSize: 9
      }}>New</span>}{item.m === 'nv' && <span className="bg bg-nv" style={{
        marginRight: 5,
        fontSize: 9
      }}>Not Verified</span>}{item.m === 'toggle' ? <label className="tgl" style={{
        marginLeft: 'auto'
      }}><input type="checkbox" defaultChecked={true} /><span className="ts" /></label> : <Icon n="chevron_right" size={15} color="var(--t3)" />}</div>)}{!isReadOnly && <div className="sr" style={{
      background: 'rgba(229,62,62,.03)'
    }}><div className="sic" style={{
      background: 'var(--rd)',
      border: '1px solid rgba(229,62,62,.2)'
    }}><Icon n="trash" size={15} color="var(--red)" /></div><span className="slb dng">Delete Staff</span></div>}</div>;
  const notesSection = tab === 'not' ? <div className="cd notes-wrap" style={{
    margin: '12px 14px 14px',
    overflow: 'hidden'
  }}>{NOTES.map((n, i) => <div key={i} className="nc"><Av name={emp.name} size={30} r={8} /><div className="nb2"><div className="nm2"><div className="note-meta"><span className="nn">{emp.name}</span><span className="note-pill" style={{
      background: `${accentColor}12`,
      color: accentColor
    }}>Note</span></div><span className="nd2">{n.date}</span></div><div className="ntx">{n.text}</div></div></div>)}<div className="ni3" style={{
    background: 'var(--s1)'
  }}><button type="button" className="note-icon-btn"><Icon n="camera" size={18} color="var(--t2)" /></button><input placeholder="Save a note..." /><button type="button" className="note-send-btn" style={{
    background: accentColor
  }}><Icon n="send" size={13} color="#fff" /></button></div></div> : null;
  const salarySection = tab === 'sal' ? <div className="cd" style={{
    margin: '12px 14px 14px'
  }}><div style={{
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '11px 17px',
    borderBottom: '1px solid var(--br)'
  }}><button className="dnb dnl" style={{
      background: accentColor,
      width: 28,
      height: 28,
      fontSize: 16
    }} onClick={() => setPayslipMonth(m => m === 1 ? 12 : m - 1)}>‹</button><div className="dl" style={{
      flex: 1,
      justifyContent: 'center'
    }}><Icon n="calendar" size={13} color="var(--t2)" /> {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][payslipMonth - 1]} 2026</div><button className="dnb dnr" style={{
      width: 28,
      height: 28,
      fontSize: 16
    }} onClick={() => setPayslipMonth(m => m === 12 ? 1 : m + 1)}>›</button></div>{salLoading ? <div style={{
    padding: 20,
    textAlign: 'center'
  }}>Loading salary...</div> : <div style={{
    padding: '8px 0'
  }}><div className="salr sal-p"><span className="sall">Payable Amount</span><span className="salv">₹ {empSalCalc.payable.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}</span></div><div className="salr"><span className="sall">Basic</span><span className="salv">₹ {Number(sd.basic || 0).toLocaleString('en-IN')}</span></div><div className="salr"><span className="sall">HRA</span><span className="salv">₹ {Number(sd.hra || 0).toLocaleString('en-IN')}</span></div><div className="salr"><span className="sall">DA</span><span className="salv">₹ {Number(sd.da || 0).toLocaleString('en-IN')}</span></div><div className="salr"><span className="sall">Bonus</span><span className="salv">₹ {Number(sd.bonus || 0).toLocaleString('en-IN')}</span></div><div className="salr"><span className="sall">Overtime</span><span className="salv">₹ {Number(sd.overtime || 0).toLocaleString('en-IN')}</span></div><div className="salr"><span className="sall">Incentive</span><span className="salv">₹ {Number(sd.incentive || 0).toLocaleString('en-IN')}</span></div>{empReimb > 0 && <div className="salr"><span className="sall">Approved Reimbursement</span><span className="salv" style={{
        color: 'var(--grn)'
      }}>+₹ {Number(empReimb || 0).toLocaleString('en-IN')}</span></div>}<div style={{
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
    padding: '14px 17px 0'
  }}><button className="btn bs btn-full" onClick={() => alert('Salary advance feature will be available soon.')}>Pay Advance</button><button className="btn btn-full" style={{
      background: accentColor,
      color: '#fff'
    }} onClick={() => alert('Salary payout action will be available soon.')}>Pay Salary</button></div><div style={{
    padding: '13px 17px',
    borderTop: '1px solid var(--br)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap'
  }}><div style={{
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--t2)',
    marginRight: 'auto'
  }}>Selected month: {monthLabel}</div><button className="btn btn-full" style={{
      background: accentColor,
      color: '#fff',
      maxWidth: 320
    }} onClick={() => setShowPayslipDet(true)}><Icon n="download" size={13} color="#fff" />View / Download Pay Slip</button></div></div>}</div> : null;

  if (subPage === 'personal') return /*#__PURE__*/React.createElement(PersonalForm, {
    emp: emp,
    onBack: () => setSubPage(null),
    accentColor: accentColor
  });

  if (subPage) {
    const pageLabels = {
      current: 'Current Employment',
      custom: 'Custom Details',
      background: 'Background Verification',
      attendance: 'Attendance Details',
      salary: 'Salary Details',
      bank: 'Bank Details',
      notifications: 'Notifications',
      requests: 'Requests'
    };
    return /*#__PURE__*/React.createElement("div", {
      style: {
        animation: 'fi .2s ease'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "bk",
      onClick: () => setSubPage(null)
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "arrow_left",
      size: 18,
      color: "var(--t2)"
    }), /*#__PURE__*/React.createElement("span", {
      className: "bkl"
    }, "Back")), /*#__PURE__*/React.createElement("div", {
      className: "cd"
    }, /*#__PURE__*/React.createElement("div", {
      className: "cd-h"
    }, /*#__PURE__*/React.createElement("span", {
      className: "cd-t"
    }, pageLabels[subPage] || 'Details')), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 18,
        color: 'var(--t2)'
      }
    }, "This section is under construction. Select another section from the top bar or click back.")));
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      animation: 'fi .2s ease'
    }
  }, showPayslipDet && /*#__PURE__*/React.createElement(PayslipModal, {
    onClose: () => setShowPayslipDet(false),
    empData: emp,
    salData: {
      ...sd,
      month: payslipMonth,
      year: 2026
    },
    salSettings: salarySettings || DEFAULT_SALARY_SETTINGS,
    month: payslipMonth,
    year: 2026,
    globalReimb: globalReimb || []
  }), /*#__PURE__*/React.createElement("div", {
    className: "bk",
    onClick: onBack
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "arrow_left",
    size: 18,
    color: "var(--t2)"
  }), /*#__PURE__*/React.createElement("span", {
    className: "bkl"
  }, "Back")), /*#__PURE__*/React.createElement("div", {
    className: "cd"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ep"
  }, /*#__PURE__*/React.createElement("div", {
    className: "eaw"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 80,
      height: 80,
      borderRadius: '50%',
      background: `linear-gradient(135deg,${AC[(emp.name || 'A').charCodeAt(0) % AC.length]},${AC[((emp.name || 'A').charCodeAt(0) + 2) % AC.length]})`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 28,
      fontWeight: 800,
      color: '#fff',
      border: `3px solid ${accentColor}30`,
      margin: '0 auto'
    }
  }, (emp.name || 'A').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()), /*#__PURE__*/React.createElement("div", {
    className: "ecb",
    style: {
      background: accentColor
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "camera",
    size: 11,
    color: "#fff"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "enm"
  }, emp.name), /*#__PURE__*/React.createElement("div", {
    className: "eph"
  }, emp.phone), /*#__PURE__*/React.createElement("div", {
    className: "erl"
  }, emp.role, " \xB7 ", emp.dept), !isReadOnly && /*#__PURE__*/React.createElement("div", {
    className: "ear"
  }, [{
    ic: 'phone',
    l: 'Call',
    onClick: () => openEmployeeAction('call')
  }, {
    ic: 'message',
    l: 'Text',
    onClick: () => openEmployeeAction('text')
  }, {
    ic: 'map_pin',
    l: 'Location',
    onClick: () => openEmployeeAction('location')
  }, {
    ic: 'crm',
    l: 'CRM',
    onClick: () => openEmployeeAction('crm')
  }].map(item => /*#__PURE__*/React.createElement("div", {
    key: item.l,
    className: "eab",
    style: {
      cursor: 'pointer'
    },
    onClick: item.onClick
  }, /*#__PURE__*/React.createElement("div", {
    className: "eai"
  }, /*#__PURE__*/React.createElement(Icon, {
    n: item.ic,
    size: 16,
    color: "var(--t2)"
  })), /*#__PURE__*/React.createElement("div", {
    className: "eal"
  }, item.l)))), /*#__PURE__*/React.createElement("div", {
    className: "etabs"
  }, [['att', 'ATTENDANCE'], ['sal', 'SALARY'], ['not', 'NOTES']].map(([k, l]) => /*#__PURE__*/React.createElement("div", {
    key: k,
    className: `et ${tab === k ? 'on' : ''}`,
    style: tab === k ? {
      color: accentColor,
      borderBottomColor: accentColor
    } : {},
    onClick: () => setTab(k)
  }, l))), tab === 'att' && /*#__PURE__*/React.createElement("div", {
      className: "cd",
      style: {
        margin: '12px 14px 14px',
        padding: '14px 17px',
        overflow: 'hidden'
      }
    }, editDayModal && /*#__PURE__*/React.createElement("div", {
      className: "modal-ov",
      onClick: e => e.target === e.currentTarget && setEditDayModal(null)
    }, /*#__PURE__*/React.createElement("div", {
      className: "modal-box",
      style: {
        maxWidth: 380
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "modal-head"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "modal-title"
    }, editDayModal.dayNum, "th ", MONTHS_SH[attendanceMonth - 1], " \u2014 Edit Attendance"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: 'var(--t2)',
        marginTop: 2
      }
    }, emp.name)), /*#__PURE__*/React.createElement("button", {
      style: {
        width: 28,
        height: 28,
        borderRadius: 7,
        background: 'var(--s2)',
        border: '1px solid var(--br)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      },
      onClick: () => setEditDayModal(null)
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "x",
      size: 14,
      color: "var(--t2)"
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '16px 20px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 700,
        color: 'var(--t1)',
        marginBottom: 10
      }
    }, "Attendance Status"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 14
      }
    }, [['p', 'PRESENT', 'var(--grn)', 'rgba(22,163,74,0.12)'], ['a', 'ABSENT', 'var(--red)', 'rgba(229,62,62,0.1)'], ['h', 'HALF DAY', 'var(--amb)', 'rgba(217,119,6,0.1)'], ['w', 'WEEK OFF', 'var(--t2)', 'var(--s2)'], ['hol', 'HOLIDAY', 'var(--teal)', 'var(--td)']].map(([val, lbl, clr, bg]) => /*#__PURE__*/React.createElement("button", {
      key: val,
      onClick: () => setEditDayModal(m => ({
        ...m,
        newStatus: val
      })),
      style: {
        padding: '8px 14px',
        borderRadius: 20,
        border: `2px solid ${editDayModal.newStatus === val ? clr : 'var(--br2)'}`,
        background: editDayModal.newStatus === val ? bg : 'var(--s1)',
        color: editDayModal.newStatus === val ? clr : 'var(--t2)',
        fontSize: 11,
        fontWeight: 700,
        cursor: 'pointer',
        fontFamily: 'Inter',
        transition: 'all .15s'
      }
    }, lbl))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 700,
        color: 'var(--t1)',
        marginBottom: 8
      }
    }, "Leave Type"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 14
      }
    }, [['pl', 'PAID LEAVE', 'var(--pur)'], ['hdl', 'HALF DAY LEAVE', 'var(--blu)'], ['ul', 'UNPAID LEAVE', 'var(--teal)']].map(([val, lbl, clr]) => /*#__PURE__*/React.createElement("button", {
      key: val,
      onClick: () => setEditDayModal(m => ({
        ...m,
        newStatus: val
      })),
      style: {
        padding: '7px 13px',
        borderRadius: 20,
        border: `2px solid ${editDayModal.newStatus === val ? clr : 'var(--br2)'}`,
        background: editDayModal.newStatus === val ? `${clr}15` : 'var(--s1)',
        color: editDayModal.newStatus === val ? clr : 'var(--t2)',
        fontSize: 11,
        fontWeight: 700,
        cursor: 'pointer',
        fontFamily: 'Inter',
        transition: 'all .15s'
      }
    }, lbl))), /*#__PURE__*/React.createElement("hr", {
      style: {
        border: 'none',
        borderTop: '1px solid var(--br)',
        margin: '4px 0 12px'
      }
    }), editDayModal.punchIn && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '9px 12px',
        background: 'var(--s2)',
        borderRadius: 9,
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement(Av, {
      name: emp.name,
      size: 32,
      r: 8
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 700,
        color: 'var(--t1)'
      }
    }, editDayModal.punchIn, " ", /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--grn)',
        fontWeight: 800
      }
    }, "\u2022 In"), " \xA0FULL DAY SHIFT"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: 'var(--t2)',
        marginTop: 2
      }
    }, emp.loc || 'C-101, Lakeside, Lakeshore Greens, Palava'))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement("button", {
      style: {
        flex: 1,
        background: 'none',
        border: '1px solid var(--br2)',
        borderRadius: 8,
        padding: '8px',
        fontSize: 11,
        fontWeight: 700,
        color: 'var(--blu)',
        cursor: 'pointer',
        fontFamily: 'Inter',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5
      },
      onClick: () => setEditDayModal(m => ({
        ...m,
        punchIn: m.punchIn ? null : '10:23 AM'
      }))
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "plus",
      size: 12,
      color: "var(--blu)"
    }), editDayModal.punchIn ? 'REMOVE PUNCH IN' : '+ ADD PUNCH IN'), /*#__PURE__*/React.createElement("button", {
      style: {
        flex: 1,
        background: 'none',
        border: '1px solid var(--br2)',
        borderRadius: 8,
        padding: '8px',
        fontSize: 11,
        fontWeight: 700,
        color: 'var(--blu)',
        cursor: 'pointer',
        fontFamily: 'Inter',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5
      },
      onClick: () => setEditDayModal(m => ({
        ...m,
        punchOut: m.punchOut ? null : '06:30 PM'
      }))
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "plus",
      size: 12,
      color: "var(--blu)"
    }), editDayModal.punchOut ? 'REMOVE PUNCH OUT' : '+ ADD PUNCH OUT')), /*#__PURE__*/React.createElement("textarea", {
      className: "f-in",
      rows: 2,
      placeholder: "Add Note...",
      value: editDayModal.note || '',
      onChange: e => setEditDayModal(m => ({
        ...m,
        note: e.target.value
      })),
      style: {
        resize: 'vertical',
        marginBottom: 0
      }
    })), /*#__PURE__*/React.createElement("div", {
      className: "modal-foot"
    }, /*#__PURE__*/React.createElement("button", {
      className: "btn bs btn-full",
      onClick: () => setEditDayModal(null)
    }, "Cancel"), /*#__PURE__*/React.createElement("button", {
      className: "btn btn-full",
      style: {
        background: accentColor,
        color: '#fff'
      },
      onClick: async () => {
        try {
          const nextStatus = (editDayModal.newStatus || 'a') === 'hdl' ? 'h' : editDayModal.newStatus || 'a';
          await saveAttendanceForDay(editDayModal.dayNum, nextStatus, {
            punchIn: editDayModal.punchIn,
            punchOut: editDayModal.punchOut,
            note: editDayModal.note,
            editReason: `Updated attendance for ${String(editDayModal.dayNum).padStart(2, '0')} ${MONTHS_SH[attendanceMonth - 1]} ${attendanceYear}`
          });
          setAttOverrides(o => ({
            ...o,
            [editDayModal.dayNum]: nextStatus
          }));
          setPunchData(p => ({
            ...p,
            [editDayModal.dayNum]: {
              ...(p[editDayModal.dayNum] || {}),
              punchIn: editDayModal.punchIn,
              punchOut: editDayModal.punchOut,
              note: editDayModal.note,
              status: nextStatus
            }
          }));
          await fetchAttendance();
          setEditDayModal(null);
        } catch (error) {
          console.error('Error saving attendance changes:', error);
          alert('Failed to save attendance changes. Please try again.');
        }
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "check",
      size: 13,
      color: "#fff"
    }), "Save Changes")))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12,
        flexWrap: 'wrap',
        marginBottom: 14,
        padding: '12px 14px',
        background: 'var(--s1)',
        border: '1px solid var(--br)',
        borderRadius: 10,
        boxShadow: 'var(--shadow)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 4
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 700,
        color: 'var(--t1)'
      }
    }, "Attendance Calendar"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: 'var(--t2)'
      }
    }, "Present, absent, holiday, leave and week off overview")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 10,
        flexWrap: 'wrap',
        marginLeft: 'auto'
      }
    }, !isReadOnly && [{
      ic: 'check',
      l: 'Mark All Present',
      action: 'mark'
    }, {
      ic: 'map_pin',
      l: 'Live Location',
      action: 'location'
    }, {
      ic: 'receipt',
      l: 'Salary Slip',
      action: 'slip'
    }, {
      ic: 'download',
      l: 'Download Report',
      action: 'report'
    }].map(item => /*#__PURE__*/React.createElement("div", {
      key: item.l,
      style: {
        textAlign: 'center',
        cursor: 'pointer',
        minWidth: 88
      },
      onClick: item.action === 'mark' ? handleMarkAllPresent : item.action === 'location' ? () => openEmployeeAction('location') : item.action === 'slip' ? () => {
        setPayslipMonth(attendanceMonth);
        setShowPayslipDet(true);
      } : downloadAttendanceReport
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 38,
        height: 38,
        borderRadius: 10,
        background: `${accentColor}12`,
        border: `1px solid ${accentColor}25`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 5px'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      n: item.ic,
      size: 16,
      color: accentColor
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        fontWeight: 700,
        color: accentColor,
        lineHeight: 1.3
      }
    }, item.l))))), /*#__PURE__*/React.createElement("div", {
      className: "cal-sum"
    }, /*#__PURE__*/React.createElement("div", {
      className: "cal-col"
    }, /*#__PURE__*/React.createElement("div", {
      className: "cal-n",
      style: {
        color: 'var(--grn)'
      }
    }, counts.p), /*#__PURE__*/React.createElement("div", {
      className: "cal-l"
    }, "Present")), /*#__PURE__*/React.createElement("div", {
      className: "cal-col"
    }, /*#__PURE__*/React.createElement("div", {
      className: "cal-n",
      style: {
        color: 'var(--red)'
      }
    }, counts.a), /*#__PURE__*/React.createElement("div", {
      className: "cal-l"
    }, "Absent")), /*#__PURE__*/React.createElement("div", {
      className: "cal-col"
    }, /*#__PURE__*/React.createElement("div", {
      className: "cal-n",
      style: {
        color: 'var(--teal)'
      }
    }, counts.hol), /*#__PURE__*/React.createElement("div", {
      className: "cal-l"
    }, "Holiday")), /*#__PURE__*/React.createElement("div", {
      className: "cal-col"
    }, /*#__PURE__*/React.createElement("div", {
      className: "cal-n",
      style: {
        color: 'var(--amb)'
      }
    }, counts.h), /*#__PURE__*/React.createElement("div", {
      className: "cal-l"
    }, "Half Day")), /*#__PURE__*/React.createElement("div", {
      className: "cal-col"
    }, /*#__PURE__*/React.createElement("div", {
      className: "cal-n",
      style: {
        color: 'var(--pur)'
      }
    }, counts.pl), /*#__PURE__*/React.createElement("div", {
      className: "cal-l"
    }, "Paid Leave")), /*#__PURE__*/React.createElement("div", {
      className: "cal-col"
    }, /*#__PURE__*/React.createElement("div", {
      className: "cal-n",
      style: {
        color: 'var(--blu)'
      }
    }, counts.w), /*#__PURE__*/React.createElement("div", {
      className: "cal-l"
    }, "Week Off"))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        padding: '12px 14px',
        marginBottom: 12,
        background: 'var(--s1)',
        border: '1px solid var(--br)',
        borderRadius: 10,
        boxShadow: 'var(--shadow)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        fontWeight: 700,
        color: 'var(--t2)',
        whiteSpace: 'nowrap'
      }
    }, "Change Month"), /*#__PURE__*/React.createElement("button", {
      className: "dnb dnl",
      style: {
        background: accentColor,
        width: 28,
        height: 28,
        fontSize: 16,
        flexShrink: 0
      },
      onClick: () => changeVisibleMonth(-1)
    }, "‹"), /*#__PURE__*/React.createElement("div", {
      className: "dl",
      style: {
        flex: 1,
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "calendar",
      size: 13,
      color: "var(--t2)"
    }), " ", monthLabel), /*#__PURE__*/React.createElement("button", {
      className: "dnb dnr",
      style: {
        width: 28,
        height: 28,
        fontSize: 16,
        flexShrink: 0
      },
      onClick: () => changeVisibleMonth(1)
    }, "›")), /*#__PURE__*/React.createElement("div", {
      className: "cg",
      style: {
        marginBottom: 8
      }
    }, ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => /*#__PURE__*/React.createElement("div", {
      key: d,
      className: "ch"
    }, d))), /*#__PURE__*/React.createElement("div", {
      className: "cg"
    }, Array.from({
      length: firstDayOffset
    }, (_, i) => /*#__PURE__*/React.createElement("div", {
      key: `e${i}`,
      className: "day de"
    })), Array.from({
      length: totalDaysInMonth
    }, (_, i) => {
      const dayNum = i + 1;
      const d = String(dayNum).padStart(2, '0');
      const st = getStatus(dayNum);
      const isFuture = new Date(attendanceYear, attendanceMonth - 1, dayNum) > new Date();
      const cls = isFuture ? 'df' : statCls[st] || 'dw';
      const pd = punchData[dayNum] || punchData[d];
      const isLate = pd?.isLate && st === 'p';
      const monthText = new Date(attendanceYear, attendanceMonth - 1, dayNum).toLocaleDateString('en-GB', {
        month: 'short'
      });
      const yearText = String(attendanceYear);
      const statusText = isFuture ? '' : {
        p: 'Present',
        a: 'Absent',
        hol: 'Holiday',
        h: 'Half Day',
        hdl: 'Half Day',
        pl: 'Paid Leave',
        w: 'Week Off',
        ul: 'Unpaid Leave'
      }[st] || 'Absent';
      return /*#__PURE__*/React.createElement("div", {
        key: d,
        className: `day ${cls}`,
        style: {
          minHeight: 92,
          aspectRatio: 'auto',
          justifyContent: 'flex-start',
          padding: '10px 4px 8px',
          ...(!isReadOnly && !isFuture ? {
            cursor: 'pointer'
          } : {})
        },
        onClick: !isReadOnly && !isFuture ? () => setEditDayModal({
          dayNum,
          newStatus: st,
          punchIn: pd?.punchIn || null,
          punchOut: pd?.punchOut || null,
          note: pd?.note || ''
        }) : undefined,
        title: !isReadOnly && !isFuture ? `Edit ${dayNum} ${MONTHS_SH[attendanceMonth - 1]}` : ''
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'center',
          gap: 4
        }
      }, /*#__PURE__*/React.createElement("span", {
        className: "day-num"
      }, d), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 9,
          fontWeight: 700,
          color: 'var(--t2)',
          textTransform: 'uppercase'
        }
      }, monthText)), /*#__PURE__*/React.createElement("span", {
        style: {
          display: 'block',
          marginTop: 2,
          fontSize: 8,
          fontWeight: 600,
          color: 'var(--t2)'
        }
      }, yearText), statusText && /*#__PURE__*/React.createElement("span", {
        style: {
          display: 'block',
          marginTop: 10,
          fontSize: 8.5,
          fontWeight: 700,
          color: st === 'p' ? 'var(--grn)' : st === 'a' || st === 'ul' ? 'var(--red)' : st === 'hol' ? 'var(--teal)' : st === 'pl' ? 'var(--pur)' : st === 'w' ? 'var(--blu)' : 'var(--amb)',
          textTransform: 'uppercase',
          letterSpacing: '.3px'
        }
      }, statusText), isLate && /*#__PURE__*/React.createElement("span", {
        className: "dt-late"
      }, "LATE"), !isReadOnly && !isFuture && /*#__PURE__*/React.createElement("div", {
        className: "dt-badge",
        style: {
          background: `${accentColor}70`
        }
      }));
    })), !isReadOnly && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 8,
        fontSize: 9,
        color: 'var(--t3)',
        textAlign: 'right',
        fontStyle: 'italic'
      }
    }, "Tap any day to edit"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 10,
        marginTop: 12
      }
    }, /*#__PURE__*/React.createElement("button", {
      className: "btn bs btn-full",
      onClick: downloadAttendanceReport
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "download",
      size: 13
    }), "Download Report"), /*#__PURE__*/React.createElement("button", {
      className: "btn btn-full",
      style: {
        background: accentColor,
        color: '#fff'
      },
      onClick: () => {
        setPayslipMonth(attendanceMonth);
        setShowPayslipDet(true);
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "receipt",
      size: 13,
      color: "#fff"
    }), "View Salary Slip"))), salarySection, notesSection, detailSectionList)));
};

// ─── BRANCH SELECTOR COMPONENT ────────────────────────────────────────────
const BranchSelector = ({
  branches,
  selected,
  onChange,
  accentColor
}) => {
  const [open, setOpen] = useState(false);
  const isAllBranches = selected === 'all' || !selected;
  const sel = isAllBranches ? { id: 'all', name: 'All Branches', color: '#00A884', address: '' } : (branches.find(b => b.id === selected) || { id: 'all', name: 'All Branches', color: '#00A884', address: '' });
  return /*#__PURE__*/React.createElement("div", {
    className: "branch-sel"
  }, /*#__PURE__*/React.createElement("button", {
    className: "branch-btn",
    onClick: () => setOpen(!open),
    style: open ? {
      borderColor: accentColor,
      background: sel.id === 'all' ? `rgba(0,168,132,0.06)` : undefined
    } : {}
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: sel.color,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      textAlign: 'left'
    }
  }, sel.name), /*#__PURE__*/React.createElement(Icon, {
    n: "chevron_down",
    size: 12,
    color: "var(--t2)"
  })), open && /*#__PURE__*/React.createElement("div", {
    className: "branch-dropdown"
  }, [{ id: 'all', name: 'All Branches', color: '#00A884', address: '' }, ...branches].map(b => /*#__PURE__*/React.createElement("div", {
    key: b.id,
    className: `branch-opt ${(selected === b.id || (b.id === 'all' && (selected === 'all' || !selected))) ? 'sel' : ''}`,
    onClick: () => {
      onChange(b.id);
      setOpen(false);
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "branch-dot",
    style: {
      background: b.color
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--t1)'
    }
  }, b.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: 'var(--t2)',
      marginTop: 1
    }
  }, b.address)), selected === b.id && /*#__PURE__*/React.createElement(Icon, {
    n: "check",
    size: 13,
    color: "var(--teal)"
  })))));
};

// ─── LOCATION SETTINGS ───────────────────────────────────────────────────
const LocationSettings = ({
  geoSettings,
  setGeoSettings
}) => {
  const [loc, setLoc] = useState(geoSettings);
  const [saved, setSaved] = useState(false);
  const [gettingLoc, setGettingLoc] = useState(false);
  const radii = [50, 100, 150, 200, 300, 500, 1000];
  
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    
    setGettingLoc(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLoc({
          ...loc,
          lat: latitude,
          lng: longitude,
          address: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`
        });
        setGettingLoc(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your location. Please enter manually.');
        setGettingLoc(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };
  
  const handleSave = () => {
    setGeoSettings(loc);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "cd-h"
  }, /*#__PURE__*/React.createElement("span", {
    className: "cd-t"
  }, "Location & Geofence Settings")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 17
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'rgba(0,168,132,0.06)',
      border: '1px solid rgba(0,168,132,0.2)',
      borderRadius: 10,
      padding: '10px 12px',
      marginBottom: 14,
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "info",
    size: 14,
    color: "var(--teal)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: 'var(--t2)'
    }
  }, "Employees must be within the defined radius to mark attendance.")), /*#__PURE__*/React.createElement("div", {
    className: "fg"
  }, /*#__PURE__*/React.createElement("label", {
    className: "fl"
  }, "Office Location / Address"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement("input", {
    className: "f-in",
    style: {
      flex: 1
    },
    value: loc.address,
    onChange: e => setLoc({
      ...loc,
      address: e.target.value
    }),
    placeholder: "Enter office address or use current location"
  }), /*#__PURE__*/React.createElement("button", {
    className: "btn bs",
    style: {
      padding: '0 12px',
      fontSize: 10,
      fontWeight: 700
    },
    onClick: getCurrentLocation,
    disabled: gettingLoc
  }, /*#__PURE__*/React.createElement(Icon, {
    n: gettingLoc ? 'loader' : 'map_pin',
    size: 11,
    color: "var(--teal)",
    spin: gettingLoc
  }), gettingLoc ? '...' : 'Use Current'))), /*#__PURE__*/React.createElement("div", {
    className: "fr"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fg"
  }, /*#__PURE__*/React.createElement("label", {
    className: "fl"
  }, "Latitude"), /*#__PURE__*/React.createElement("input", {
    className: "f-in",
    type: "number",
    step: "0.0001",
    value: loc.lat,
    onChange: e => setLoc({
      ...loc,
      lat: parseFloat(e.target.value) || 0
    })
  })), /*#__PURE__*/React.createElement("div", {
    className: "fg"
  }, /*#__PURE__*/React.createElement("label", {
    className: "fl"
  }, "Longitude"), /*#__PURE__*/React.createElement("input", {
    className: "f-in",
    type: "number",
    step: "0.0001",
    value: loc.lng,
    onChange: e => setLoc({
      ...loc,
      lng: parseFloat(e.target.value) || 0
    })
  }))), /*#__PURE__*/React.createElement("div", {
    className: "fg"
  }, /*#__PURE__*/React.createElement("label", {
    className: "fl"
  }, "Allowed Radius"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 7,
      marginTop: 4
    }
  }, radii.map(r => /*#__PURE__*/React.createElement("button", {
    key: r,
    onClick: () => setLoc({
      ...loc,
      radius: r
    }),
    className: "chip",
    style: loc.radius === r ? {
      background: 'var(--teal)',
      color: '#fff',
      borderColor: 'var(--teal)'
    } : {}
  }, r, "m"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8,
      fontSize: 11,
      color: 'var(--t2)'
    }
  }, "Selected: ", /*#__PURE__*/React.createElement("strong", null, loc.radius, " meters"))), /*#__PURE__*/React.createElement("div", {
    className: "geo-map"
  }, /*#__PURE__*/React.createElement("div", {
    className: "geo-circle",
    style: {
      width: Math.min(loc.radius / 2, 130),
      height: Math.min(loc.radius / 2, 130)
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "geo-pin"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 8,
      right: 10,
      fontSize: 9,
      color: 'var(--t2)',
      background: 'rgba(255,255,255,0.9)',
      padding: '2px 7px',
      borderRadius: 4
    }
  }, "Radius: ", loc.radius, "m"), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 8,
      left: 10,
      fontSize: 10,
      color: 'var(--t2)',
      background: 'rgba(255,255,255,0.9)',
      padding: '2px 7px',
      borderRadius: 4,
      display: 'flex',
      alignItems: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "map_pin",
    size: 11,
    color: "var(--teal)"
  }), loc.address.split(',')[0])), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-full",
    style: {
      background: 'var(--teal)',
      color: '#fff',
      padding: '11px',
      borderRadius: 10,
      fontSize: 13
    },
    onClick: handleSave
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "check",
    size: 15,
    color: "#fff"
  }), saved ? 'Saved!' : 'Save Location Settings')));
};

const BranchLocationModal = ({
  branch,
  onClose,
  onSave
}) => {
  const [loc, setLoc] = useState({
    address: branch?.address || '',
    lat: branch?.lat || 0,
    lng: branch?.lng || 0,
    radius: branch?.radius || 200
  });
  const [saved, setSaved] = useState(false);
  const [gettingLoc, setGettingLoc] = useState(false);
  const radii = [50, 100, 150, 200, 300, 500, 1000];

  React.useEffect(() => {
    if (branch) {
      setLoc({
        address: branch.address || '',
        lat: branch.lat || 0,
        lng: branch.lng || 0,
        radius: branch.radius || 200
      });
    }
  }, [branch]);

  const requestCurrent = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setGettingLoc(true);
    navigator.geolocation.getCurrentPosition(
      position => {
        setLoc(l => ({
          ...l,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          address: `Lat: ${position.coords.latitude.toFixed(6)}, Lng: ${position.coords.longitude.toFixed(6)}`
        }));
        setGettingLoc(false);
      },
      () => {
        alert('Unable to determine location.');
        setGettingLoc(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return /*#__PURE__*/React.createElement("div", {
    className: "modal-ov",
    onClick: e => e.target === e.currentTarget && onClose(),
    style: {
      zIndex: 1000000
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-box",
    style: {
      maxWidth: 480
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "modal-title"
  }, "Edit Branch Geofence"), /*#__PURE__*/React.createElement("button", {
    style: {
      width: 28,
      height: 28,
      borderRadius: 7,
      background: 'var(--s2)',
      border: '1px solid var(--br)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    onClick: onClose
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "x",
    size: 14,
    color: "var(--t2)"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "modal-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fg"
  }, /*#__PURE__*/React.createElement("label", {
    className: "fl"
  }, "Branch"), /*#__PURE__*/React.createElement("input", {
    className: "f-in",
    value: branch?.name || '',
    readOnly: true
  })), /*#__PURE__*/React.createElement("div", {
    className: "fg"
  }, /*#__PURE__*/React.createElement("label", {
    className: "fl"
  }, "Address"), /*#__PURE__*/React.createElement("input", {
    className: "f-in",
    value: loc.address,
    onChange: e => setLoc({
      ...loc,
      address: e.target.value
    }),
    placeholder: "Branch address"
  }), /*#__PURE__*/React.createElement("button", {
    className: "btn bs",
    style: {
      marginTop: 6,
      fontSize: 11
    },
    onClick: requestCurrent,
    disabled: gettingLoc
  }, gettingLoc ? 'Locating...' : 'Use Current Location')),
  /*#__PURE__*/React.createElement("div", {
    className: "fr"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fg"
  }, /*#__PURE__*/React.createElement("label", {
    className: "fl"
  }, "Latitude"), /*#__PURE__*/React.createElement("input", {
    className: "f-in",
    type: "number",
    step: "0.000001",
    value: loc.lat,
    onChange: e => setLoc({
      ...loc,
      lat: parseFloat(e.target.value) || 0
    })
  })), /*#__PURE__*/React.createElement("div", {
    className: "fg"
  }, /*#__PURE__*/React.createElement("label", {
    className: "fl"
  }, "Longitude"), /*#__PURE__*/React.createElement("input", {
    className: "f-in",
    type: "number",
    step: "0.000001",
    value: loc.lng,
    onChange: e => setLoc({
      ...loc,
      lng: parseFloat(e.target.value) || 0
    })
  }))), /*#__PURE__*/React.createElement("div", {
    className: "fg"
  }, /*#__PURE__*/React.createElement("label", {
    className: "fl"
  }, "Geofence Radius"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 4
    }
  }, radii.map(r => /*#__PURE__*/React.createElement("button", {
    key: r,
    onClick: () => setLoc({
      ...loc,
      radius: r
    }),
    className: "chip",
    style: loc.radius === r ? {
      background: 'var(--teal)',
      color: '#fff',
      borderColor: 'var(--teal)'
    } : {}
  }, r, "m")))), /*#__PURE__*/React.createElement("div", {
    className: "modal-foot"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn bs btn-full",
    onClick: onClose
  }, "Cancel"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-full",
    style: {
      background: 'var(--teal)',
      color: '#fff'
    },
    onClick: () => {
      onSave(loc);
      setSaved(true);
      setTimeout(() => setSaved(false), 1200);
    }
  }, saved ? 'Saved!' : 'Save')))));
};

// ─── LOGIN ────────────────────────────────────────────────────────────────
const Login = ({
  onLogin
}) => {
  const [role, setRole] = useState('superadmin');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const roleIcons = {
    superadmin: 'shield',
    hr: 'users',
    employee: 'user'
  };
  const t = THEME[role];
  const handleRole = r => {
    setRole(r);
    setEmail('');
    setPass('');
    setErr('');
  };
  const hints = {};
  const fillCreds = () => {};
  const handleLogin = async () => {
    if (!email || !pass) {
      setErr('Email and password are required');
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: email,
          password: pass,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const userData = {
          id: data.user.id,
          empId: data.user.empId || data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: normalizeUserRole(data.user.role),
          token: data.access_token
        };
        onLogin(userData);
        // Save to localStorage for persistence across refreshes
        if (typeof window !== 'undefined') {
          localStorage.setItem('userAuth', JSON.stringify(userData));
        }
      } else {
        const errorData = await response.json();
        setErr(errorData.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErr('Network error. Please try again.');
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "login-wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "login-box"
  }, /*#__PURE__*/React.createElement("div", {
    className: "login-logo"
  }, /*#__PURE__*/React.createElement("div", {
    className: "login-mark",
    style: {
      background: t.logoGrad,
      boxShadow: t.logoShadow
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "building",
    size: 26,
    color: "#fff"
  })), /*#__PURE__*/React.createElement("div", {
    className: "login-title"
  }, "CityHomes HRMS"), /*#__PURE__*/React.createElement("div", {
    className: "login-sub"
  }, "Sign in to your dashboard")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: 'var(--t2)',
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: '.8px'
    }
  }, "Select Role"), /*#__PURE__*/React.createElement("div", {
    className: "role-cards"
  }, [['superadmin', 'Super Admin'], ['hr', 'HR Manager'], ['employee', 'Employee']].map(([r, l]) => /*#__PURE__*/React.createElement("div", {
    key: r,
    className: `role-card ${r} ${role === r ? 'active' : ''}`,
    onClick: () => handleRole(r)
  }, /*#__PURE__*/React.createElement("div", {
    className: "role-ico"
  }, /*#__PURE__*/React.createElement(Icon, {
    n: roleIcons[r],
    size: 20,
    color: role === r ? t.tagColor : 'var(--t3)'
  })), /*#__PURE__*/React.createElement("div", {
    className: "role-lbl"
  }, l)))), /*#__PURE__*/React.createElement("div", {
    className: "fg",
    style: {
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "fl"
  }, "Email"), /*#__PURE__*/React.createElement("input", {
    className: "fi",
    value: email,
    onChange: e => setEmail(e.target.value),
    placeholder: "Enter email",
    style: {
      margin: 0
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "fg",
    style: {
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "fl"
  }, "Password"), /*#__PURE__*/React.createElement("input", {
    className: "fi",
    type: "password",
    value: pass,
    onChange: e => setPass(e.target.value),
    placeholder: "Enter password",
    style: {
      margin: 0
    },
    onKeyDown: e => e.key === 'Enter' && handleLogin()
  })), err && /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--rd)',
      border: '1px solid rgba(229,62,62,0.2)',
      borderRadius: 8,
      padding: '8px 12px',
      fontSize: 11,
      color: 'var(--red)',
      marginBottom: 10,
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "alert",
    size: 13,
    color: "var(--red)"
  }), err), /*#__PURE__*/React.createElement("button", {
    className: `login-btn lb-${role === 'superadmin' ? 'sa' : role === 'hr' ? 'hr' : 'em'}`,
    onClick: handleLogin
  }, "Sign In"), /*#__PURE__*/React.createElement("div", {
    className: "login-hint"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hint-t"
  }, "Login Help"), Object.entries(hints).map(([r, h]) => /*#__PURE__*/React.createElement("div", {
    key: r,
    className: "hint-row",
    onClick: () => fillCreds(r),
    style: {
      cursor: 'pointer',
      borderRadius: 5,
      padding: '1px 3px',
      transition: 'background .15s'
    },
    onMouseEnter: e => e.currentTarget.style.background = 'var(--s3)',
    onMouseLeave: e => e.currentTarget.style.background = ''
  }, /*#__PURE__*/React.createElement("span", {
    className: "hint-lbl"
  }, r === 'superadmin' ? 'Super Admin' : r === 'hr' ? 'HR Manager' : 'Employee'), /*#__PURE__*/React.createElement("span", {
    className: "hint-val"
  }, h.email, " / ", h.pass))))));
};

// ─── RECEIPT VIEW MODAL ───────────────────────────────────────────────────
const ReceiptModal = ({
  url,
  title,
  onClose
}) => /*#__PURE__*/React.createElement("div", {
  className: "modal-ov",
  onClick: e => e.target === e.currentTarget && onClose()
}, /*#__PURE__*/React.createElement("div", {
  className: "modal-box",
  style: {
    maxWidth: 520
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "modal-head"
}, /*#__PURE__*/React.createElement("span", {
  className: "modal-title"
}, "Receipt \u2014 ", title), /*#__PURE__*/React.createElement("button", {
  style: {
    width: 28,
    height: 28,
    borderRadius: 7,
    background: 'var(--s2)',
    border: '1px solid var(--br)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  onClick: onClose
}, /*#__PURE__*/React.createElement(Icon, {
  n: "x",
  size: 14,
  color: "var(--t2)"
}))), /*#__PURE__*/React.createElement("div", {
  style: {
    padding: 16,
    textAlign: 'center'
  }
}, /*#__PURE__*/React.createElement("img", {
  src: url,
  alt: "receipt",
  style: {
    width: '100%',
    borderRadius: 10,
    border: '1px solid var(--br)',
    objectFit: 'contain',
    maxHeight: 380
  }
}), /*#__PURE__*/React.createElement("div", {
  style: {
    marginTop: 10,
    display: 'flex',
    gap: 8,
    justifyContent: 'center'
  }
}, /*#__PURE__*/React.createElement("a", {
  href: url,
  download: "receipt.png",
  style: {
    textDecoration: 'none'
  }
}, /*#__PURE__*/React.createElement("button", {
  className: "btn bs btn-sm"
}, /*#__PURE__*/React.createElement(Icon, {
  n: "download",
  size: 13
}), "Download"))))));

// ─── SALARY CALCULATOR ───────────────────────────────────────────────────
const calcSalary = (sd, reimbApprovedAmt = 0, settings = DEFAULT_SALARY_SETTINGS) => {
  if (!sd) return {
    gross: 0,
    lopAmt: 0,
    payable: 0,
    perDay: 0,
    paidDays: 0,
    totalDays: 0,
    weekoffs: 0,
    paidHols: 0
  };
  const month = sd.month || 3;
  const year = sd.year || 2026;
  // Total calendar days in month
  const totalDays = settings.periodType === 'fixed' ? settings.fixedDays : getMonthDays(month, year);
  // Count weekly offs and paid holidays
  const {
    weekoffs,
    paidHols
  } = countPaidOffDays(month, year, settings);
  // Paid days = present days + weekly off days + paid holidays
  const paidDays = (sd.presentDays || 0) + weekoffs + paidHols;
  // Per day rate = basic / total calendar days in month
  const perDay = sd.basic / totalDays;
  // Earned basic = per day * paid days (cannot exceed basic)
  const earnedBasic = Math.min(sd.basic, Math.round(perDay * paidDays));
  // LOP = basic - earned basic
  const lopAmt = Math.max(0, sd.basic - earnedBasic);
  // LOP days = total - paidDays
  const lopDays = Math.max(0, totalDays - paidDays);
  // Gross = all components
  const gross = earnedBasic + (sd.hra || 0) + (sd.da || 0) + (sd.bonus || 0) + (sd.overtime || 0) + (sd.incentive || 0);
  const payable = Math.max(0, gross) + reimbApprovedAmt;
  return {
    gross,
    lopAmt,
    lopDays,
    payable,
    perDay,
    earnedBasic,
    paidDays,
    totalDays,
    weekoffs,
    paidHols,
    presentDays: sd.presentDays || 0,
    basic: sd.basic || 0
  };
};

// ─── SUPER ADMIN PANEL ────────────────────────────────────────────────────
const SAPanel = ({
  user,
  onLogout,
  geoSettings,
  setGeoSettings,
  globalStaff,
  setGlobalStaff,
  globalLeaves,
  setGlobalLeaves,
  globalActivity,
  setGlobalActivity,
  globalBranches,
  setGlobalBranches,
  globalReimb,
  setGlobalReimb,
  salarySettings,
  setSalarySettings,
  salaryData,
  setSalaryData,
  empNotifs,
  addEmpNotif,
  yearlyHolidays,
  setYearlyHolidays
}) => {
  const t = THEME.superadmin;
  const [page, setPage] = useState('home');
  const [emp, setEmp] = useState(null);
  const [sideOpen, setSideOpen] = useState(false);
  const [attTab, setAttTab] = useState('live');
  const [attFilter, setAttFilter] = useState('all');
  const [settingsSub, setSettingsSub] = useState('att');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [depts, setDepts] = useState([]);
  const [deptLoading, setDeptLoading] = useState(false);
  const [showAttModal, setShowAttModal] = useState(false);
  const [showAddDept, setShowAddDept] = useState(false);
  const [branchGeoModal, setBranchGeoModal] = useState(null);
  const [branchGeoSaving, setBranchGeoSaving] = useState(false);
  const [newDept, setNewDept] = useState({ name: '', description: '', week_off_days: [] });
  const [selectedDept, setSelectedDept] = useState(null);
  const [isEditingDept, setIsEditingDept] = useState(false);

  const fetchDepts = async () => {
    setDeptLoading(true);
    try {
      const r = await fetch(`${API_BASE}/departments`, {
        credentials: 'include'
      });
      if (r.ok) {
        const data = await r.json();
        const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        console.log('Departments loaded:', list);
        setDepts(list);
      } else {
        console.error('Failed to fetch departments:', r.status);
        setDepts([]);
      }
    } catch (e) {
      console.error('Error fetching departments:', e);
      setDepts([]);
    }
    setDeptLoading(false);
  };

  useEffect(() => {
    if (page === 'departments' || settingsSub === 'departments') fetchDepts();
  }, [page, settingsSub]);

  const handleSaveDept = async () => {
    if (!newDept.name) return alert('Department name is required');
    if (newDept.name.length < 2) return alert('Department name must be at least 2 characters');

    const payload = {
      name: newDept.name.trim(),
      description: newDept.description?.trim() || '',
      week_off_days: newDept.week_off_days || []
    };

    try {
      const url = isEditingDept && selectedDept ? `/departments/${selectedDept.id}` : '/departments';
      const method = isEditingDept && selectedDept ? 'PATCH' : 'POST';

      const r = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const responseData = await r.json();

      if (r.ok) {
        const action = isEditingDept ? 'updated' : 'created';
        alert(`Department "${payload.name}" ${action} successfully!`);
        setShowAddDept(false);
        setSelectedDept(null);
        setIsEditingDept(false);
        setNewDept({ name: '', description: '', week_off_days: [] });
        await new Promise(resolve => setTimeout(resolve, 300));
        fetchDepts();
      } else {
        alert(`Error: ${responseData.message || responseData.error || 'Failed to save department'}`);
      }
    } catch (e) {
      console.error('Error saving department:', e);
      alert(`Network error: ${e.message}`);
    }
  };

  const handleOpenAddDept = () => {
    console.log('Add Dept clicked');
    setSelectedDept(null);
    setIsEditingDept(false);
    setNewDept({ name: '', description: '', week_off_days: [] });
    setShowAddDept(true);
  };

  const handleEditDept = (department) => {
    setSelectedDept(department);
    setIsEditingDept(true);
    setNewDept({
      name: department.name || '',
      description: department.description || '',
      week_off_days: department.week_off_days || []
    });
    setShowAddDept(true);
  };

  const handleDeleteDept = async (department) => {
    if (!confirm(`Delete ${department.name}?`)) return;
    try {
      const r = await fetch(`/departments/${department.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (r.ok) {
        alert(`Department "${department.name}" deleted successfully!`);
        await new Promise(resolve => setTimeout(resolve, 300));
        fetchDepts();
      } else {
        const err = await r.json();
        alert(`Error: ${err.message || 'Failed to delete department'}`);
      }
    } catch (e) {
      console.error('Delete error:', e);
      alert(`Network error: ${e.message}`);
    }
  };

  const handleOpenBranchGeo = (branch) => {
    setBranchGeoModal(branch);
  };

  const handleSaveBranchGeo = async (loc) => {
    if (!branchGeoModal) return;
    setBranchGeoSaving(true);

    try {
      const payload = {
        address: loc.address,
        lat: parseFloat(loc.lat) || 0,
        lng: parseFloat(loc.lng) || 0,
        radius: Number(loc.radius) || 200
      };

      const r = await fetch(`/branches/${branchGeoModal.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (r.ok) {
        const updatedBranch = await r.json();
        setGlobalBranches(bs => bs.map(b => b.id === updatedBranch.id ? updatedBranch : b));
        addActivity('Super Admin', 'Super Admin', `updated geofence for ${updatedBranch.name}`, `${updatedBranch.address}`, 'branch', 'var(--teal)');
        setBranchGeoModal(null);
      } else {
        const err = await r.json().catch(() => ({}));
        alert(`Failed to save branch location: ${err.message || 'Unknown error'}`);
      }
    } catch (e) {
      console.error('Error saving branch location:', e);
      alert('Network error while saving branch location');
    }

    setBranchGeoSaving(false);
  };

  const toggleDay = (day) => {
    setNewDept(prev => ({
      ...prev,
      week_off_days: prev.week_off_days.includes(day) 
        ? prev.week_off_days.filter(d => d !== day)
        : [...prev.week_off_days, day]
    }));
  };

  const dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayNamesLong = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [showAddBranch, setShowAddBranch] = useState(false);
  const [pendTab, setPendTab] = useState('leave');
  const [search, setSearch] = useState('');
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [viewReceiptData, setViewReceiptData] = useState(null);
  const [payrollMonth, setPayrollMonth] = useState('March 2026');
  const [paidIds, setPaidIds] = useState(new Set());
  const [editSalEmpId, setEditSalEmpId] = useState(null);
  const [showPayslip, setShowPayslip] = useState(null); // {empData, salData, month, year}
  const [saPayrollList, setSaPayrollList] = useState([]);
  const [saPayrollLoading, setSaPayrollLoading] = useState(false);
  const [attDate, setAttDate] = useState(new Date(2026, 2, 21));
  const [showSAAttModal, setShowSAAttModal] = useState(false);
  const [saPunchStatus, setSaPunchStatus] = useState('out'); // 'in' | 'out'
  const [saPunchLog, setSaPunchLog] = useState([]); // [{type,time,addr,date}]
  // HR's own attendance
  const [hrPunchStatus, setHrPunchStatus] = useState('out'); // 'in' | 'out'
  const [hrPunchLog, setHrPunchLog] = useState([]); // [{type,time,addr,date,id}]
  const [hrAttData, setHrAttData] = useState({}); // { '27': {punchIn, punchOut, note} }
  
  // Fetch all employee attendance data from backend for Super Admin
  useEffect(() => {
    const fetchAllAttendance = async () => {
      try {
        const liveRes = await fetch(`/attendance/live`, { credentials: 'include' });
        if (liveRes.ok) {
          const { employees } = await liveRes.json();
          setGlobalStaff(staff => staff.map(emp => {
            const live = employees.find(le => le.id === emp.id);
            if (live) {
              return {
                ...emp,
                ls: live.punchInTime && !live.punchOutTime ? 'in' : live.punchOutTime ? 'out' : 'nopunch',
                pt: live.punchInTime ? (
                  live.punchOutTime ? (
                    live.punchOutAuto ? '11:59 PM (Auto)' : new Date(live.punchOutTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
                  ) : new Date(live.punchInTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
                ) : '-',
                status: live.status
              };
            }
            return emp;
          }));
        }
      } catch (error) { console.error(error); }
    };
    
    fetchAllAttendance();
    
    // Refresh every minute
    const interval = setInterval(fetchAllAttendance, 60000);
    
    return () => clearInterval(interval);
  }, [setGlobalStaff]);

  useEffect(() => {
    if (page !== 'payroll') return;
    const [mName, y] = payrollMonth.split(' ');
    const monthIndex = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].indexOf(mName) + 1;
    if (monthIndex <= 0) return;

    setSaPayrollLoading(true);
    fetch(`/payroll?month=${monthIndex}&year=${y}`, { credentials: 'include' })
      .then(async res => {
        if (!res.ok) throw new Error(`Payroll fetch failed: ${res.status}`);
        const data = await res.json();
        setSaPayrollList(Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []);
      })
      .catch(error => {
        console.error('Super Admin payroll fetch error:', error);
        setSaPayrollList([]);
      })
      .finally(() => setSaPayrollLoading(false));
  }, [page, payrollMonth]);

  const navItems = [{
    id: 'home',
    ic: 'home',
    l: 'Dashboard'
  }, {
    id: 'att',
    ic: 'users',
    l: 'Attendance'
  }, {
    id: 'emp',
    ic: 'users',
    l: 'Employees'
  }, {
    id: 'payroll',
    ic: 'dollar',
    l: 'Payroll'
  }, {
    id: 'branches',
    ic: 'branch',
    l: 'Branches'
  }, {
    id: 'departments',
    ic: 'building',
    l: 'Departments'
  }, {
    id: 'activity',
    ic: 'activity',
    l: 'Activity Log'
  }, {
    id: 'notif',
    ic: 'bell',
    l: 'Notifications'
  }, {
    id: 'pend',
    ic: 'clipboard',
    l: 'Pending'
  }, {
    id: 'reports',
    ic: 'chart',
    l: 'Reports'
  }, {
    id: 'settings',
    ic: 'settings',
    l: 'Settings'
  }];
  const go = p => {
    if (p === 'departments') {
      setPage('departments');
      setSideOpen(false);
      return;
    }
    setPage(p);
    if (p !== 'emp-detail') setEmp(null);
    setSideOpen(false);
  };
  const filteredStaff = selectedBranch === 'all' ? globalStaff : globalStaff.filter(s => s.branch === selectedBranch);
  const searchedStaff = filteredStaff.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.role.toLowerCase().includes(search.toLowerCase()));
  const pendingLeaves = globalLeaves.filter(r => r.status === 'pending').length;
  const pendingReimb = globalReimb.filter(r => r.status === 'pending').length;
  const totalPending = pendingLeaves + pendingReimb;
  const addActivity = (who, role, action, detail, type, color) => {
    const item = {
      id: Date.now(),
      who,
      role,
      action,
      detail,
      when: 'Just now',
      type,
      color
    };
    setGlobalActivity(a => [item, ...a.slice(0, 19)]);
  };
  const handleAddStaff = async data => {
    try {
      const response = await fetch(`${API_BASE}/employees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const newStaff = await response.json();
        setGlobalStaff(s => [...s, {
          ...newStaff,
          name: newStaff.name,
          email: newStaff.email,
          role: newStaff.designation || newStaff.role,
          dept: newStaff.department?.name || '—',
          branch: newStaff.branch?.id || 'b1'
        }]);
        addActivity('Super Admin', 'Super Admin', `added new staff ${newStaff.name}`, `${newStaff.designation || newStaff.role} · ${newStaff.department?.name || '—'}`, 'staff', 'var(--teal)');
        return { success: true, staff: newStaff };
      } else {
        const err = await response.json();
        return { success: false, message: err.message || 'Failed to add staff' };
      }
    } catch (error) {
      console.error('Error adding staff:', error);
      return { success: false, message: 'Network error while adding staff' };
    }
  };
  const handleAddBranch = async (data) => {
    try {
      const res = await fetch(`${API_BASE}/branches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: data.name,
          address: data.address,
          phone: data.phone,
          manager: data.manager
        })
      });
      if (res.ok) {
        const newBranch = await res.json();
        setGlobalBranches(b => [...b, newBranch]);
        addActivity('Super Admin', 'Super Admin', `added new branch ${newBranch.name}`, newBranch.address, 'branch', 'var(--teal)');
        setShowAddBranch(false);
      } else {
        alert('Failed to add branch');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to add branch');
    }
  };
  const branchOf = id => globalBranches.find(b => b.id === id)?.name || '—';
  
  // Global effect to prevent body scroll when any modal is open
  React.useEffect(() => {
    if (showAddStaff || showAddBranch) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = scrollbarWidth + 'px';
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [showAddStaff, showAddBranch]);
  
  return /*#__PURE__*/React.createElement("div", {
    className: "layout"
  }, showAddStaff && /*#__PURE__*/React.createElement(AddStaffModal, {
    onClose: () => setShowAddStaff(false),
    onAdd: handleAddStaff,
    branches: globalBranches,
    departments: depts,
    accentColor: t.acc,
    currentUserRole: user?.role || 'hr'
  }), showAddBranch && /*#__PURE__*/React.createElement(AddBranchModal, {
    onClose: () => setShowAddBranch(false),
    onAdd: handleAddBranch
  }), branchGeoModal && /*#__PURE__*/React.createElement(BranchLocationModal, {
    branch: branchGeoModal,
    onClose: () => setBranchGeoModal(null),
    onSave: handleSaveBranchGeo
  }), viewReceiptData && /*#__PURE__*/React.createElement(ReceiptModal, {
    url: viewReceiptData.url,
    title: viewReceiptData.title,
    onClose: () => setViewReceiptData(null)
  }), showPayslip && /*#__PURE__*/React.createElement(PayslipModal, {
    onClose: () => setShowPayslip(null),
    empData: showPayslip.empData,
    salData: showPayslip.salData,
    salSettings: salarySettings,
    month: showPayslip.month,
    year: showPayslip.year,
    globalReimb: globalReimb
  }), showSAAttModal && /*#__PURE__*/React.createElement(AttendanceModal, {
    user: user,
    onClose: () => setShowSAAttModal(false),
    userName: user.name,
    geoSettings: geoSettings,
    currentStatus: saPunchStatus,
    onSuccess: (type, time, addr) => {
      setSaPunchStatus(type);
      const entry = {
        id: Date.now(),
        type,
        time,
        addr,
        date: 'Today'
      };
      setSaPunchLog(l => [entry, ...l]);
      addActivity('Super Admin', 'Super Admin', `marked ${type === 'in' ? 'Punch In' : 'Punch Out'}`, `${time} · ${addr}`, 'punch', type === 'in' ? 'var(--grn)' : 'var(--red)');
    }
  }), sideOpen && /*#__PURE__*/React.createElement("div", {
    className: "mob-overlay on",
    onClick: () => setSideOpen(false)
  }), /*#__PURE__*/React.createElement("aside", {
    className: "sb",
    style: sideOpen ? {
      transform: 'translateX(0)'
    } : {}
  }, /*#__PURE__*/React.createElement("div", {
    className: "sb-logo"
  }, /*#__PURE__*/React.createElement("div", {
    className: "logo-m",
    style: {
      background: t.logoGrad,
      boxShadow: t.logoShadow
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "building",
    size: 18,
    color: "#fff"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "logo-n"
  }, "City Homes"), /*#__PURE__*/React.createElement("div", {
    className: "logo-s"
  }, /*#__PURE__*/React.createElement("span", {
    className: "role-tag",
    style: {
      background: t.tagBg,
      color: t.tagColor
    }
  }, "Super Admin")))), /*#__PURE__*/React.createElement("div", {
    className: "nav"
  }, /*#__PURE__*/React.createElement("div", {
    className: "nl"
  }, "Main"), navItems.map(n => /*#__PURE__*/React.createElement("div", {
    key: n.id,
    className: `ni ${page === n.id || (n.id === 'departments' && (page === 'departments' || page === 'settings' && settingsSub === 'departments')) || (page === 'emp-detail' && n.id === 'emp') ? 'active' : ''}`,
    style: page === n.id || (n.id === 'departments' && (page === 'departments' || page === 'settings' && settingsSub === 'departments')) || (page === 'emp-detail' && n.id === 'emp') ? {
      background: t.accDim,
      color: t.acc
    } : {},
    onClick: () => go(n.id)
  }, /*#__PURE__*/React.createElement(Icon, {
    n: n.ic,
    size: 15,
    color: page === n.id || (n.id === 'departments' && (page === 'departments' || page === 'settings' && settingsSub === 'departments')) ? t.acc : 'var(--t2)'
  }), /*#__PURE__*/React.createElement("span", null, n.l), n.id === 'pend' && totalPending > 0 && /*#__PURE__*/React.createElement("span", {
    className: "nb nb-r"
  }, totalPending), n.id === 'notif' && /*#__PURE__*/React.createElement("span", {
    className: "nb nb-r"
  }, "4"))), /*#__PURE__*/React.createElement("div", {
    className: "nl",
    style: {
      marginTop: 5
    }
  }, "Quick Access"), [['zap', 'Free Tools'], ['target', 'CRM'], ['gift', 'Bonuses']].map(([ic, l]) => /*#__PURE__*/React.createElement("div", {
    key: l,
    className: "ni"
  }, /*#__PURE__*/React.createElement(Icon, {
    n: ic,
    size: 15,
    color: "var(--t2)"
  }), /*#__PURE__*/React.createElement("span", null, l), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      color: 'var(--t3)',
      background: 'var(--s2)',
      padding: '1px 5px',
      borderRadius: 3,
      marginLeft: 'auto'
    }
  }, "Soon")))), /*#__PURE__*/React.createElement("div", {
    className: "sb-bot"
  }, /*#__PURE__*/React.createElement("div", {
    className: "uc"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ua",
    style: {
      background: t.logoGrad
    }
  }, t.tag), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "un"
  }, user.name), /*#__PURE__*/React.createElement("div", {
    className: "ur"
  }, user.company))), /*#__PURE__*/React.createElement("button", {
    className: "logout-btn",
    onClick: onLogout
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "logout",
    size: 14,
    color: "var(--red)"
  }), "Logout"))), /*#__PURE__*/React.createElement("div", {
    className: "tb"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hamb",
    onClick: () => setSideOpen(!sideOpen)
  }, /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("span", null)), /*#__PURE__*/React.createElement("div", {
    className: "tb-t"
  }, page === 'emp-detail' ? emp?.name : navItems.find(n => n.id === page)?.l || 'Dashboard'), /*#__PURE__*/React.createElement("div", {
    className: "tb-r"
  }, /*#__PURE__*/React.createElement(BranchSelector, {
    branches: globalBranches,
    selected: selectedBranch,
    onChange: setSelectedBranch,
    accentColor: t.acc
  }), /*#__PURE__*/React.createElement("div", {
    className: "ib",
    style: {
      position: 'relative'
    },
    onClick: () => go('notif')
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "bell",
    size: 16,
    color: "var(--t2)"
  }), /*#__PURE__*/React.createElement("div", {
    className: "nd"
  })), /*#__PURE__*/React.createElement(Av, {
    name: user.name,
    size: 30,
    r: 8
  }))), /*#__PURE__*/React.createElement("div", {
    className: "main"
  }, page === 'emp-detail' && emp ? /*#__PURE__*/React.createElement("div", {
    className: "pg on"
  }, /*#__PURE__*/React.createElement(EmpDetail, {
    emp: emp,
    onBack: () => go('emp'),
    accentColor: t.acc,
    userRole: "superadmin",
    salaryData: salaryData,
    salarySettings: salarySettings,
    globalReimb: globalReimb,
    yearlyHolidays: yearlyHolidays,
    setSalaryData: setSalaryData,
    setGlobalActivity: setGlobalActivity
  })) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: `pg ${page === 'home' ? 'on' : ''}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "ph"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "pt"
  }, "Overview"), /*#__PURE__*/React.createElement("div", {
    className: "ps"
  }, "Sat, 21 Mar 2026 \xB7 ", selectedBranch === 'all' ? 'All Branches' : globalBranches.find(b => b.id === selectedBranch)?.name)), /*#__PURE__*/React.createElement("div", {
    className: "pa"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn bs btn-sm"
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "download",
    size: 13
  }), "Export"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-sm",
    style: {
      background: t.acc,
      color: '#fff'
    },
    onClick: () => setShowAddStaff(true)
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "plus",
    size: 13,
    color: "#fff"
  }), "Add Staff"))), /*#__PURE__*/React.createElement("div", {
    className: "sg"
  }, [{
    l: 'Staff In',
    v: filteredStaff.filter(s => s.ls === 'in').length,
    c: t.acc,
    ic: 'users',
    t: 'Present today',
    up: true
  }, {
    l: 'No Punch In',
    v: filteredStaff.filter(s => s.ls === 'nopunch').length,
    c: 'var(--red)',
    ic: 'clock',
    t: 'Yet to mark',
    up: false
  }, {
    l: 'Pending Requests',
    v: totalPending,
    c: 'var(--amb)',
    ic: 'clipboard',
    t: 'Needs review',
    up: false
  }, {
    l: 'Total Staff',
    v: filteredStaff.length,
    c: 'var(--blu)',
    ic: 'building',
    t: 'Active employees',
    up: true
  }].map(s => /*#__PURE__*/React.createElement("div", {
    key: s.l,
    className: "sc"
  }, /*#__PURE__*/React.createElement("div", {
    className: "si",
    style: {
      background: `${s.c}18`
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: s.ic,
    size: 18,
    color: s.c
  })), /*#__PURE__*/React.createElement("div", {
    className: "sn",
    style: {
      color: s.c
    }
  }, s.v), /*#__PURE__*/React.createElement("div", {
    className: "sl"
  }, s.l), /*#__PURE__*/React.createElement("div", {
    className: `st ${s.up ? 'su' : 'sd'}`
  }, s.up ? '↑ ' : '↓ ', s.t)))), /*#__PURE__*/React.createElement("div", {
    className: "g2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cd"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cd-h"
  }, /*#__PURE__*/React.createElement("span", {
    className: "cd-t"
  }, "Live Attendance \xB7 21 Mar"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "bg bg-in"
  }, filteredStaff.filter(s => s.ls === 'in').length, " In"), /*#__PURE__*/React.createElement("span", {
    className: "bg bg-np"
  }, filteredStaff.filter(s => s.ls === 'nopunch').length, " No Punch"))), /*#__PURE__*/React.createElement("table", null, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Staff"), /*#__PURE__*/React.createElement("th", null, "Branch"), /*#__PURE__*/React.createElement("th", null, "Punch"), /*#__PURE__*/React.createElement("th", null, "Status"))), /*#__PURE__*/React.createElement("tbody", null, filteredStaff.map(s => /*#__PURE__*/React.createElement("tr", {
    key: s.id,
    onClick: () => {
      setEmp(s);
      setPage('emp-detail');
    }
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    className: "av-row"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement(Av, {
    name: s.name,
    size: 26,
    r: 7
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: -1,
      right: -1,
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: s.ls === 'in' ? 'var(--grn)' : 'var(--red)',
      border: '1.5px solid var(--s1)'
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 500,
      fontSize: 11
    }
  }, s.name))), /*#__PURE__*/React.createElement("td", {
    style: {
      fontSize: 10,
      color: 'var(--t2)'
    }
  }, branchOf(s.branch)), /*#__PURE__*/React.createElement("td", {
    style: {
      fontFamily: 'monospace',
      fontSize: 10,
      color: 'var(--t2)'
    }
  }, s.pt), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: `bg ${s.ls === 'in' ? 'bg-in' : 'bg-np'}`,
    style: {
      fontSize: 9
    }
  }, s.ls === 'in' ? 'In' : 'No Punch'))))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "qa3"
  }, [['clipboard', 'Pending', 'pend'], ['branch', 'Branches', 'branches'], ['activity', 'Activity', 'activity']].map(([ic, l, p]) => /*#__PURE__*/React.createElement("div", {
    key: l,
    className: "qa",
    onClick: () => go(p)
  }, /*#__PURE__*/React.createElement("div", {
    className: "qi"
  }, /*#__PURE__*/React.createElement(Icon, {
    n: ic,
    size: 19,
    color: "var(--t2)"
  })), /*#__PURE__*/React.createElement("div", {
    className: "ql"
  }, l)))), /*#__PURE__*/React.createElement("div", {
    className: "cd",
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "cd-h"
  }, /*#__PURE__*/React.createElement("span", {
    className: "cd-t"
  }, "Weekly Trend")), /*#__PURE__*/React.createElement("div", {
    className: "cd-b"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: 4,
      height: 52
    }
  }, [55, 75, 42, 88, 68, 52, 38].map((h, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      flex: 1,
      height: `${h}%`,
      borderRadius: '4px 4px 0 0',
      background: `linear-gradient(to top,${t.acc},${t.acc}50)`,
      opacity: .8
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: 4
    }
  }, ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      fontSize: 9,
      color: 'var(--t3)',
      flex: 1,
      textAlign: 'center'
    }
  }, d)))))))), /*#__PURE__*/React.createElement("div", {
    className: `pg ${page === 'att' ? 'on' : ''}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "ph"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "pt"
  }, "Attendance"), /*#__PURE__*/React.createElement("div", {
    className: "ps"
  }, selectedBranch === 'all' ? 'All Branches' : globalBranches.find(b => b.id === selectedBranch)?.name, " \xB7 21 Mar 2026")), /*#__PURE__*/React.createElement("div", {
    className: "pa"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tabs"
  }, /*#__PURE__*/React.createElement("div", {
    className: `tab ${attTab === 'live' ? 'on' : ''}`,
    onClick: () => setAttTab('live')
  }, "Live"), /*#__PURE__*/React.createElement("div", {
    className: `tab ${attTab === 'daily' ? 'on' : ''}`,
    onClick: () => setAttTab('daily')
  }, "Daily")), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-sm",
    style: {
      background: t.acc,
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "download",
    size: 13,
    color: "#fff"
  }), "Report"))), attTab === 'live' && /*#__PURE__*/React.createElement("div", null, (() => {
    const chipCounts = {
      all: filteredStaff.length,
      'in': filteredStaff.filter(s => s.ls === 'in').length,
      nopunch: filteredStaff.filter(s => s.ls === 'nopunch').length,
      late: filteredStaff.filter(s => LATES.includes(s.pt?.split(':')[0]?.padStart(2, '0')) || false).length
    };
    const chips = [['All', 'all'], ['In', 'in'], ['No Punch', 'nopunch'], ['Late', 'late']];
    return /*#__PURE__*/React.createElement("div", {
      className: "chips"
    }, chips.map(([l, f]) => /*#__PURE__*/React.createElement("span", {
      key: l,
      className: `chip ${attFilter === f ? 'on' : ''}`,
      style: attFilter === f ? {
        background: t.accDim,
        color: t.acc,
        borderColor: t.accBorder
      } : {},
      onClick: () => setAttFilter(f)
    }, l, " ", /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: 4,
        background: attFilter === f ? t.accBorder : 'var(--s3)',
        color: attFilter === f ? t.acc : 'var(--t3)',
        borderRadius: 8,
        padding: '0px 5px',
        fontSize: 9,
        fontWeight: 700
      }
    }, chipCounts[f] || 0))));
  })(), /*#__PURE__*/React.createElement("div", {
    className: "cd"
  }, /*#__PURE__*/React.createElement("table", null, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Staff"), /*#__PURE__*/React.createElement("th", null, "Branch"), /*#__PURE__*/React.createElement("th", null, "Punch In"), /*#__PURE__*/React.createElement("th", null, "Status"))), /*#__PURE__*/React.createElement("tbody", null, filteredStaff.filter(s => attFilter === 'all' || attFilter === 'in' && s.ls === 'in' || attFilter === 'nopunch' && s.ls === 'nopunch' || attFilter === 'late' && s.ls === 'in').map(s => /*#__PURE__*/React.createElement("tr", {
    key: s.id,
    onClick: () => {
      setEmp(s);
      setPage('emp-detail');
    }
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    className: "av-row"
  }, /*#__PURE__*/React.createElement(Av, {
    name: s.name,
    size: 26,
    r: 7
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 500,
      fontSize: 11
    }
  }, s.name))), /*#__PURE__*/React.createElement("td", {
    style: {
      fontSize: 10,
      color: 'var(--t2)'
    }
  }, branchOf(s.branch)), /*#__PURE__*/React.createElement("td", {
    style: {
      fontFamily: 'monospace',
      fontSize: 10,
      color: 'var(--t2)'
    }
  }, s.pt), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: `bg ${s.ls === 'in' ? 'bg-in' : 'bg-np'}`,
    style: {
      fontSize: 9
    }
  }, s.ls === 'in' ? 'In' : 'No Punch')))))))), attTab === 'daily' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "dn"
  }, /*#__PURE__*/React.createElement("button", {
    className: "dnb dnl",
    style: {
      background: t.acc
    },
    onClick: () => setAttDate(d => {
      const nd = new Date(d);
      nd.setDate(nd.getDate() - 1);
      return nd;
    })
  }, "\u2039"), /*#__PURE__*/React.createElement("div", {
    className: "dl"
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "calendar",
    size: 13,
    color: "var(--t2)"
  }), attDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })), /*#__PURE__*/React.createElement("button", {
    className: "dnb dnr",
    onClick: () => setAttDate(d => {
      const nd = new Date(d);
      nd.setDate(nd.getDate() + 1);
      return nd;
    })
  }, "\u203A")), /*#__PURE__*/React.createElement("div", {
    className: "cd"
  }, /*#__PURE__*/React.createElement("table", null, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Staff"), /*#__PURE__*/React.createElement("th", null, "Branch"), /*#__PURE__*/React.createElement("th", null, "Punch In"), /*#__PURE__*/React.createElement("th", null, "Status"), /*#__PURE__*/React.createElement("th", null, "Action"))), /*#__PURE__*/React.createElement("tbody", null, filteredStaff.map(s => /*#__PURE__*/React.createElement("tr", {
    key: s.id
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    className: "av-row"
  }, /*#__PURE__*/React.createElement(Av, {
    name: s.name,
    size: 24,
    r: 6
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 500,
      fontSize: 11
    }
  }, s.name))), /*#__PURE__*/React.createElement("td", {
    style: {
      fontSize: 10,
      color: 'var(--t2)'
    }
  }, branchOf(s.branch)), /*#__PURE__*/React.createElement("td", {
    style: {
      fontFamily: 'monospace',
      fontSize: 10,
      color: 'var(--t2)'
    }
  }, s.status === 'present' ? s.pt : '—'), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: `bg ${s.status === 'present' ? 'bg-p' : 'bg-a'}`,
    style: {
      fontSize: 9
    }
  }, s.status === 'present' ? 'Present' : 'Absent')), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("button", {
    className: "btn bs btn-sm",
    style: {
      padding: '3px 8px',
      fontSize: 10
    },
    onClick: () => {
      setEmp(s);
      setPage('emp-detail');
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "edit",
    size: 11
  }), "Edit"))))))))), /*#__PURE__*/React.createElement("div", {
    className: `pg ${page === 'emp' ? 'on' : ''}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "ph"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "pt"
  }, "Employees"), /*#__PURE__*/React.createElement("div", {
    className: "ps"
  }, filteredStaff.length, " staff \xB7 ", selectedBranch === 'all' ? 'All Branches' : globalBranches.find(b => b.id === selectedBranch)?.name)), /*#__PURE__*/React.createElement("div", {
    className: "pa"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-sm",
    style: {
      background: t.acc,
      color: '#fff'
    },
    onClick: () => setShowAddStaff(true)
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "plus",
    size: 13,
    color: "#fff"
  }), "Add Staff"))), /*#__PURE__*/React.createElement("div", {
    className: "srch",
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "search",
    size: 14,
    color: "var(--t3)"
  }), /*#__PURE__*/React.createElement("input", {
    placeholder: "Search employees...",
    value: search,
    onChange: e => setSearch(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "cd"
  }, /*#__PURE__*/React.createElement("table", null, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Employee"), /*#__PURE__*/React.createElement("th", null, "Role"), /*#__PURE__*/React.createElement("th", null, "Branch"), /*#__PURE__*/React.createElement("th", null, "Status"), /*#__PURE__*/React.createElement("th", null, "Permission"))), /*#__PURE__*/React.createElement("tbody", null, searchedStaff.map(s => /*#__PURE__*/React.createElement("tr", {
    key: s.id,
    onClick: () => {
      setEmp(s);
      setPage('emp-detail');
    }
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    className: "av-row"
  }, /*#__PURE__*/React.createElement(Av, {
    name: s.name,
    size: 28,
    r: 8
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: 11
    }
  }, s.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: 'var(--t2)'
    }
  }, s.email)))), /*#__PURE__*/React.createElement("td", {
    style: {
      fontSize: 11,
      color: 'var(--t2)'
    }
  }, s.role), /*#__PURE__*/React.createElement("td", {
    style: {
      fontSize: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      background: globalBranches.find(b => b.id === s.branch)?.color + '15',
      color: globalBranches.find(b => b.id === s.branch)?.color,
      padding: '2px 7px',
      borderRadius: 5,
      fontSize: 9,
      fontWeight: 700
    }
  }, branchOf(s.branch))), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: `bg ${s.status === 'present' ? 'bg-p' : 'bg-a'}`,
    style: {
      fontSize: 9
    }
  }, s.status === 'present' ? 'Present' : 'Absent')), /*#__PURE__*/React.createElement("td", {
    style: {
      fontSize: 10,
      color: 'var(--t2)'
    }
  }, s.perm))), searchedStaff.length === 0 && /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: 5,
    style: {
      textAlign: 'center',
      color: 'var(--t3)',
      padding: '30px'
    }
  }, "No employees found")))))), /*#__PURE__*/React.createElement("div", {
    className: `pg ${page === 'branches' ? 'on' : ''}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "ph"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "pt"
  }, "Branches"), /*#__PURE__*/React.createElement("div", {
    className: "ps"
  }, globalBranches.filter(b => b.id !== 'all').length, " branches configured")), /*#__PURE__*/React.createElement("div", {
    className: "pa",
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-sm",
    style: {
      background: t.acc,
      color: '#fff'
    },
    onClick: () => setShowAddBranch(true)
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "plus",
    size: 13,
    color: "#fff"
  }), "Add Branch"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2,1fr)',
      gap: 12
    }
  }, globalBranches.filter(b => b.id !== 'all').map(b => {
    const bStaff = globalStaff.filter(s => s.branch === b.id);
    const present = bStaff.filter(s => s.ls === 'in').length;
    return /*#__PURE__*/React.createElement("div", {
      key: b.id,
      className: "branch-card",
      style: {
        '--bc': b.color
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "branch-name"
    }, b.name), /*#__PURE__*/React.createElement("div", {
      className: "branch-addr"
    }, b.address)), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 34,
        height: 34,
        borderRadius: 9,
        background: b.color + '18',
        border: `1px solid ${b.color}30`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "building",
      size: 17,
      color: b.color
    }))), /*#__PURE__*/React.createElement("div", {
      className: "branch-stats"
    }, /*#__PURE__*/React.createElement("div", {
      className: "branch-stat"
    }, /*#__PURE__*/React.createElement("div", {
      className: "branch-stat-n",
      style: {
        color: 'var(--grn)'
      }
    }, present), /*#__PURE__*/React.createElement("div", {
      className: "branch-stat-l"
    }, "Present")), /*#__PURE__*/React.createElement("div", {
      className: "branch-stat"
    }, /*#__PURE__*/React.createElement("div", {
      className: "branch-stat-n",
      style: {
        color: 'var(--red)'
      }
    }, bStaff.length - present), /*#__PURE__*/React.createElement("div", {
      className: "branch-stat-l"
    }, "Absent")), /*#__PURE__*/React.createElement("div", {
      className: "branch-stat"
    }, /*#__PURE__*/React.createElement("div", {
      className: "branch-stat-n",
      style: {
        color: b.color
      }
    }, bStaff.length), /*#__PURE__*/React.createElement("div", {
      className: "branch-stat-l"
    }, "Total"))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 10,
        display: 'flex',
        gap: 7
      }
    }, /*#__PURE__*/React.createElement("button", {
      className: "btn bs btn-sm",
      style: {
        flex: 1,
        fontSize: 10
      },
      onClick: () => setSelectedBranch(b.id)
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "eye",
      size: 11
    }), "View Staff"), /*#__PURE__*/React.createElement("button", {
      className: "btn bs btn-sm",
      style: {
        flex: 1,
        fontSize: 10
      },
      onClick: () => setSelectedBranch(b.id)
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "edit",
      size: 11
    }), "Edit"), /*#__PURE__*/React.createElement("button", {
      className: "btn bs btn-sm",
      style: {
        flex: 1,
        fontSize: 10,
        background: '#f5f5f5',
        color: '#333'
      },
      onClick: () => handleOpenBranchGeo(b)
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "map_pin",
      size: 11
    }), "Geofence")));
  })))), /*#__PURE__*/React.createElement("div", {
    className: `pg ${page === 'departments' ? 'on' : ''}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "ph"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "pt"
  }, "Departments"), /*#__PURE__*/React.createElement("div", {
    className: "ps"
  }, "Manage departments and weekly offs")), /*#__PURE__*/React.createElement("div", {
    className: "pa",
    style: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-sm",
    style: {
      background: t.acc,
      color: '#fff'
    },
    onClick: handleOpenAddDept
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "plus",
    size: 13,
    color: "#fff"
  }), "Add Dept"))), /*#__PURE__*/React.createElement("div", {
    className: "cd"
  }, deptLoading ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 20,
      textAlign: 'center'
    }
  }, "Loading...") : depts.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 20,
      textAlign: 'center',
      color: 'var(--t3)'
    }
  }, "No departments found") : /*#__PURE__*/React.createElement("table", null, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Department Name"), /*#__PURE__*/React.createElement("th", null, "Week Off"), /*#__PURE__*/React.createElement("th", {
    style: {
      textAlign: 'right'
    }
  }, "Action"))), /*#__PURE__*/React.createElement("tbody", null, depts.map(d => /*#__PURE__*/React.createElement("tr", {
    key: d.id
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: 12
    }
  }, d.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: 'var(--t3)'
    }
  }, d.description || 'No description')), /*#__PURE__*/React.createElement("td", null, d.week_off_days.length > 0 ? d.week_off_days.map(day => dayNamesShort[day]).join(', ') : 'No fixed off'), /*#__PURE__*/React.createElement("td", {
    style: {
      textAlign: 'right'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      gap: 6,
      justifyContent: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn bs btn-sm",
    style: {
      padding: '4px 8px'
    },
    onClick: () => handleEditDept(d)
  }, "Edit"), /*#__PURE__*/React.createElement("button", {
    className: "btn bs btn-sm",
    style: {
      padding: '4px 8px'
    },
    onClick: () => handleDeleteDept(d)
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "trash",
    size: 12,
    color: "var(--red)"
  })))))))), showAddDept && /*#__PURE__*/React.createElement("div", {
    className: "modal-ov",
    onClick: e => e.target === e.currentTarget && setShowAddDept(false),
    style: {
      zIndex: 1000000
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-box",
    style: {
      maxWidth: 400
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "modal-title"
  }, isEditingDept ? 'Edit Department' : 'Create Department')), /*#__PURE__*/React.createElement("div", {
    className: "modal-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fg"
  }, /*#__PURE__*/React.createElement("label", {
    className: "fl"
  }, "Department Name"), /*#__PURE__*/React.createElement("input", {
    className: "f-in",
    placeholder: "eg. Marketing",
    value: newDept.name,
    onChange: e => setNewDept({
      ...newDept,
      name: e.target.value
    })
  })), /*#__PURE__*/React.createElement("div", {
    className: "fg"
  }, /*#__PURE__*/React.createElement("label", {
    className: "fl"
  }, "Description"), /*#__PURE__*/React.createElement("input", {
    className: "f-in",
    placeholder: "Optional",
    value: newDept.description,
    onChange: e => setNewDept({
      ...newDept,
      description: e.target.value
    })
  })), /*#__PURE__*/React.createElement("div", {
    className: "fg"
  }, /*#__PURE__*/React.createElement("label", {
    className: "fl"
  }, "Week Off Days"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: 4
    }
  }, dayNamesShort.map((day, i) => /*#__PURE__*/React.createElement("button", {
    key: day,
    className: `btn btn-sm ${newDept.week_off_days.includes(i) ? '' : 'bs'}`,
    style: newDept.week_off_days.includes(i) ? {
      background: t.acc,
      color: '#fff'
    } : {},
    onClick: () => toggleDay(i)
  }, day))))), /*#__PURE__*/React.createElement("div", {
    className: "modal-foot"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn bs btn-full",
    onClick: () => {
      setShowAddDept(false);
      setSelectedDept(null);
      setIsEditingDept(false);
      setNewDept({ name: '', description: '', week_off_days: [] });
    }
  }, "Cancel"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-full",
    style: {
      background: t.acc,
      color: '#fff'
    },
    onClick: handleSaveDept
  }, isEditingDept ? 'Update Department' : 'Save Department'))))), /*#__PURE__*/React.createElement("div", {
    className: `pg ${page === 'activity' ? 'on' : ''}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "ph"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "pt"
  }, "Activity Log"), /*#__PURE__*/React.createElement("div", {
    className: "ps"
  }, "All changes made by employees, HR and Super Admin"))), /*#__PURE__*/React.createElement("div", {
    className: "cd"
  }, globalActivity.map((a, i) => /*#__PURE__*/React.createElement("div", {
    key: a.id,
    className: "act-item"
  }, /*#__PURE__*/React.createElement("div", {
    className: "act-dot",
    style: {
      background: a.color
    }
  }), i < globalActivity.length - 1 && /*#__PURE__*/React.createElement("div", {
    className: "act-line"
  }), /*#__PURE__*/React.createElement("div", {
    className: "act-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "act-who"
  }, a.who, " ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 400,
      color: 'var(--t2)'
    }
  }, a.action)), /*#__PURE__*/React.createElement("div", {
    className: "act-what"
  }, a.detail), /*#__PURE__*/React.createElement("div", {
    className: "act-when"
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "clock",
    size: 10,
    color: "var(--t3)"
  }), a.when, " ", /*#__PURE__*/React.createElement("span", {
    style: {
      background: a.color + '15',
      color: a.color,
      fontSize: 9,
      padding: '1px 6px',
      borderRadius: 4,
      fontWeight: 600,
      marginLeft: 4
    }
  }, a.role))))))), /*#__PURE__*/React.createElement("div", {
    className: `pg ${page === 'notif' ? 'on' : ''}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "ph"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "pt"
  }, "Notifications"), /*#__PURE__*/React.createElement("div", {
    className: "ps"
  }, "Real-time activity feed"))), saPunchLog.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      fontWeight: 700,
      color: 'var(--t3)',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      marginBottom: 8
    }
  }, "Your Attendance Today"), saPunchLog.map((log, i) => /*#__PURE__*/React.createElement("div", {
    key: log.id,
    className: "cd",
    style: {
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '13px 17px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40,
      height: 40,
      borderRadius: 11,
      background: log.type === 'in' ? 'rgba(22,163,74,0.12)' : 'rgba(229,62,62,0.1)',
      border: `1.5px solid ${log.type === 'in' ? 'rgba(22,163,74,0.3)' : 'rgba(229,62,62,0.25)'}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "clock",
    size: 18,
    color: log.type === 'in' ? 'var(--grn)' : 'var(--red)'
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: 'var(--t1)'
    }
  }, user.name, " ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 400,
      color: 'var(--t2)'
    }
  }, "punched ", log.type === 'in' ? 'in' : 'out')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--t2)',
      marginTop: 2,
      display: 'flex',
      alignItems: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "clock",
    size: 11,
    color: "var(--t3)"
  }), log.time)), /*#__PURE__*/React.createElement("span", {
    className: `bg ${log.type === 'in' ? 'bg-in' : 'bg-np'}`,
    style: {
      fontSize: 10,
      fontWeight: 700
    }
  }, log.type === 'in' ? 'Punched In' : 'Punched Out')), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--s2)',
      borderRadius: 9,
      padding: '8px 12px',
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "map_pin",
    size: 13,
    color: log.type === 'in' ? 'var(--grn)' : 'var(--red)'
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: 'var(--t2)',
      flex: 1
    }
  }, log.addr), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      color: 'var(--t3)'
    }
  }, "Today")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: {
      flex: 1,
      background: t.accDim,
      border: `1px solid ${t.accBorder}`,
      borderRadius: 8,
      padding: '6px 10px',
      fontSize: 10,
      fontWeight: 700,
      color: t.acc,
      cursor: 'pointer',
      fontFamily: 'Inter',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4
    },
    onClick: () => alert("Live location tracking requires GPS access from your device.")
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "map_pin",
    size: 11,
    color: t.acc
  }), "Show Location"), i === 0 && saPunchStatus === 'in' && /*#__PURE__*/React.createElement("button", {
    style: {
      flex: 1,
      background: 'rgba(229,62,62,0.08)',
      border: '1px solid rgba(229,62,62,0.2)',
      borderRadius: 8,
      padding: '6px 10px',
      fontSize: 10,
      fontWeight: 700,
      color: 'var(--red)',
      cursor: 'pointer',
      fontFamily: 'Inter',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4
    },
    onClick: () => setShowSAAttModal(true)
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "clock",
    size: 11,
    color: "var(--red)"
  }), "Punch Out Now")))))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      fontWeight: 700,
      color: 'var(--t3)',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      marginBottom: 8
    }
  }, "Staff Activity"), [{
    n: 'Rajaram Yadav',
    a: 'punched in',
    t: '10:24 AM',
    d: 'Mar 21',
    addr: 'Lakeside C Wing, Dombivli'
  }, {
    n: 'Aditi Patkar',
    a: 'punched in',
    t: '10:23 AM',
    d: 'Mar 21',
    addr: 'C-101, Lakeside, Lakeshore Greens'
  }, {
    n: 'Jitendra Narendra Dhok',
    a: 'punched out',
    t: '07:34 PM',
    d: 'Mar 20',
    addr: 'Lodha Palava, Dombivli'
  }].map((n, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "cd",
    style: {
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '13px 17px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement(Av, {
    name: n.n,
    size: 28,
    r: 7
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      fontSize: 12,
      fontWeight: 600
    }
  }, n.n, " ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 400,
      color: 'var(--t2)'
    }
  }, "has ", n.a)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: 'var(--t3)'
    }
  }, n.d, " \xB7 ", n.t), /*#__PURE__*/React.createElement("span", {
    className: `bg ${n.a.includes('in') && !n.a.includes('out') ? 'bg-in' : 'bg-np'}`,
    style: {
      fontSize: 9
    }
  }, n.a.includes('in') && !n.a.includes('out') ? 'In' : 'Out')), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--s2)',
      borderRadius: 8,
      height: 55,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "camera",
    size: 16,
    color: "var(--t3)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: 'var(--t3)'
    }
  }, "Face capture")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: 'var(--t2)',
      marginBottom: 7,
      display: 'flex',
      alignItems: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "map_pin",
    size: 12,
    color: "var(--t2)"
  }), n.t, " \xB7 ", n.addr), /*#__PURE__*/React.createElement("button", {
    style: {
      background: 'var(--s2)',
      border: '1px solid var(--br2)',
      borderRadius: 7,
      padding: '4px 11px',
      fontSize: 10,
      fontWeight: 600,
      color: t.acc,
      cursor: 'pointer',
      fontFamily: 'Inter',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4
    },
    onClick: () => alert("Live location tracking requires GPS access from the employee's device.")
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "map_pin",
    size: 11,
    color: t.acc
  }), "Show Location")))), saPunchLog.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '20px',
      color: 'var(--t3)',
      fontSize: 12,
      background: 'var(--s2)',
      borderRadius: 10,
      marginBottom: 14,
      border: '1px dashed var(--br2)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "clock",
    size: 24,
    color: "var(--t3)"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8,
      fontWeight: 600,
      color: 'var(--t2)'
    }
  }, "You haven't marked attendance today"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-sm",
    style: {
      background: t.acc,
      color: '#fff',
      marginTop: 10
    },
    onClick: () => setShowSAAttModal(true)
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "clock",
    size: 12,
    color: "#fff"
  }), "Mark Punch In"))), /*#__PURE__*/React.createElement("div", {
    className: `pg ${page === 'reports' ? 'on' : ''}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "ph"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "pt"
  }, "Reports"), /*#__PURE__*/React.createElement("div", {
    className: "ps"
  }, "Download and analyze HRMS data"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: 10
    }
  }, [['chart', 'Attendance Report', 'Download monthly attendance summary'], ['dollar', 'Salary Report', 'Export salary register for all staff'], ['clipboard', 'Leave Report', 'Leave balance and usage report'], ['users', 'Employee Report', 'Staff directory and details'], ['clock', 'Late Coming Report', 'Track late arrivals and patterns'], ['doc', 'Custom Report', 'Build your own report']].map(([ic, l, desc]) => /*#__PURE__*/React.createElement("div", {
    key: l,
    className: "cd",
    style: {
      padding: 16,
      cursor: 'pointer',
      transition: 'all .18s'
    },
    onClick: () => alert(l + ' will be available for download soon.')
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40,
      height: 40,
      borderRadius: 11,
      background: t.accDim,
      border: `1px solid ${t.accBorder}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: ic,
    size: 19,
    color: t.acc
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: 'var(--t1)',
      marginBottom: 3
    }
  }, l), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: 'var(--t3)',
      lineHeight: 1.4
    }
  }, desc))))), /*#__PURE__*/React.createElement("div", {
    className: `pg ${page === 'payroll' ? 'on' : ''}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "ph"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "pt"
  }, "Payroll"), /*#__PURE__*/React.createElement("div", {
    className: "ps"
  }, "Salary processing \xB7 attendance-based calculation")), /*#__PURE__*/React.createElement("div", {
    className: "pa"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dl",
    style: {
      padding: '6px 10px',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "calendar",
    size: 13,
    color: "var(--t2)"
  }), /*#__PURE__*/React.createElement("select", {
    style: {
      background: 'none',
      border: 'none',
      outline: 'none',
      fontFamily: 'Inter',
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--t1)',
      cursor: 'pointer'
    },
    value: payrollMonth,
    onChange: e => setPayrollMonth(e.target.value)
  }, ['January 2026', 'February 2026', 'March 2026', 'April 2026'].map(m => /*#__PURE__*/React.createElement("option", {
    key: m
  }, m)))), /*#__PURE__*/React.createElement("button", {
    className: "btn bs btn-sm",
    onClick: () => {
      setPage('settings');
      setSettingsSub('salary');
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "settings",
    size: 13
  }), "Salary Settings"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-sm",
    style: {
      background: 'var(--grn)',
      color: '#fff'
    },
    onClick: () => setPaidIds(new Set(filteredStaff.map(s => s.id)))
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "check",
    size: 13,
    color: "#fff"
  }), "Process All"))), (() => {
    const tots = filteredStaff.map(s => {
      const sd = salaryData[s.id] || {
        basic: 0,
        lop: 0,
        presentDays: 0,
        workingDays: 30,
        hra: 0,
        da: 0,
        bonus: 0,
        overtime: 0,
        incentive: 0
      };
      const ra = globalReimb.filter(r => r.name === s.name && r.status === 'approved').reduce((a, r) => a + r.amount, 0);
      return calcSalary(sd, ra, salarySettings);
    });
    const totalGross = tots.reduce((a, c) => a + (c.gross || 0), 0);
    const totalPayable = filteredStaff.reduce((a, s) => {
      const sd = salaryData[s.id] || {
        basic: 0,
        lop: 0,
        presentDays: 0,
        workingDays: 30,
        hra: 0,
        da: 0,
        bonus: 0,
        overtime: 0,
        incentive: 0
      };
      const ra = globalReimb.filter(r => r.name === s.name && r.status === 'approved').reduce((a, r) => a + r.amount, 0);
      return a + calcSalary(sd, ra, salarySettings).payable;
    }, 0);
    const totalPaidAmt = filteredStaff.filter(s => paidIds.has(s.id)).reduce((a, s) => {
      const sd = salaryData[s.id] || {
        basic: 0,
        lop: 0,
        presentDays: 0,
        workingDays: 30,
        hra: 0,
        da: 0,
        bonus: 0,
        overtime: 0,
        incentive: 0
      };
      const ra = globalReimb.filter(r => r.name === s.name && r.status === 'approved').reduce((a, r) => a + r.amount, 0);
      return a + calcSalary(sd, ra, salarySettings).payable;
    }, 0);
    const totalReimb = globalReimb.filter(r => r.status === 'approved').reduce((a, r) => a + r.amount, 0);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4,1fr)',
        gap: 12,
        marginBottom: 16
      }
    }, [{
      l: 'Total Gross',
      v: '₹' + totalGross.toLocaleString(),
      c: 'var(--t1)',
      ic: 'dollar'
    }, {
      l: 'Net Payable',
      v: '₹' + totalPayable.toLocaleString(),
      c: t.acc,
      ic: 'check'
    }, {
      l: 'Paid',
      v: '₹' + totalPaidAmt.toLocaleString(),
      c: 'var(--grn)',
      ic: 'bank'
    }, {
      l: 'Reimb. Added',
      v: '₹' + totalReimb.toLocaleString(),
      c: 'var(--blu)',
      ic: 'receipt'
    }].map(s => /*#__PURE__*/React.createElement("div", {
      key: s.l,
      className: "sc"
    }, /*#__PURE__*/React.createElement("div", {
      className: "si",
      style: {
        background: `${s.c}18`
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      n: s.ic,
      size: 18,
      color: s.c
    })), /*#__PURE__*/React.createElement("div", {
      className: "sn",
      style: {
        color: s.c,
        fontSize: 18
      }
    }, s.v), /*#__PURE__*/React.createElement("div", {
      className: "sl"
    }, s.l))));
  })(), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'rgba(0,168,132,0.05)',
      border: '1px solid rgba(0,168,132,0.18)',
      borderRadius: 10,
      padding: '10px 16px',
      marginBottom: 14,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "info",
    size: 15,
    color: "var(--teal)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'var(--t1)'
    }
  }, /*#__PURE__*/React.createElement("b", null, "Salary Cycle:"), " ", salarySettings.cycleStart, "\u2013", salarySettings.cycleEnd, " every month \xA0\xB7\xA0", /*#__PURE__*/React.createElement("b", null, "Pay Date:"), " ", salarySettings.payDay, salarySettings.payMonth === 'next' ? ' of next month' : ' same month', " \xA0\xB7\xA0", /*#__PURE__*/React.createElement("b", null, "Period:"), " ", salarySettings.periodType === 'fixed' ? `${salarySettings.fixedDays} days fixed` : 'Calendar month'), /*#__PURE__*/React.createElement("button", {
    className: "btn bs btn-sm",
    style: {
      marginLeft: 'auto',
      fontSize: 10
    },
    onClick: () => {
      setPage('settings');
      setSettingsSub('salary');
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "edit",
    size: 11
  }), "Edit")), /*#__PURE__*/React.createElement("div", {
    className: "cd"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cd-h"
  }, /*#__PURE__*/React.createElement("span", {
    className: "cd-t"
  }, "Staff Payroll \u2014 ", payrollMonth), /*#__PURE__*/React.createElement("button", {
    className: "btn bs btn-sm"
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "download",
    size: 13
  }), "Export")), /*#__PURE__*/React.createElement("div", {
    style: {
      overflowX: 'auto'
    }
  }, /*#__PURE__*/React.createElement("table", null, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Employee"), /*#__PURE__*/React.createElement("th", null, "Basic"), /*#__PURE__*/React.createElement("th", null, "Present/Working"), /*#__PURE__*/React.createElement("th", null, "LOP Deducted"), /*#__PURE__*/React.createElement("th", null, "Reimb. Added"), /*#__PURE__*/React.createElement("th", null, "Net Payable"), /*#__PURE__*/React.createElement("th", null, "Status"), /*#__PURE__*/React.createElement("th", {
    style: {
      minWidth: 120
    }
  }, "Action"))), /*#__PURE__*/React.createElement("tbody", saPayrollLoading && /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
      colSpan: 8,
      style: {
        textAlign: 'center',
        color: 'var(--t3)',
        padding: 24
      }
    }, "Loading payroll data...")), null, filteredStaff.map(s => {
    const salaryFallback = salaryData[s.id] || {
      basic: 0,
      lop: 0,
      presentDays: 0,
      workingDays: 30,
      hra: 0,
      da: 0,
      bonus: 0,
      overtime: 0,
      incentive: 0
    };
    const payroll = saPayrollList.find(pr => String(pr.employee_id) === String(s.id) || String(pr.employee?.id) === String(s.id)) || {
      id: null,
      employee_id: s.id,
      employee: s,
      status: 'pending',
      basic_earned: Number(salaryFallback.basic) || 0,
      gross_amount: calcSalary(salaryFallback, globalReimb.filter(r => r.name === s.name && r.status === 'approved').reduce((a, r) => a + r.amount, 0), salarySettings).gross,
      net_payable: calcSalary(salaryFallback, globalReimb.filter(r => r.name === s.name && r.status === 'approved').reduce((a, r) => a + r.amount, 0), salarySettings).payable,
      present_days: salaryFallback.presentDays || 0,
      week_off_days: 0,
      paid_holiday_days: 0,
      lop_days: salaryFallback.lop || 0
    };
    const reimbAmt = globalReimb.filter(r => r.name === s.name && r.status === 'approved').reduce((a, r) => a + r.amount, 0);
    const sal = {
      gross: Number(payroll.gross_amount) || 0,
      lopAmt: 0,
      lopDays: payroll.lop_days || 0,
      payable: Number(payroll.net_payable) || 0,
      perDay: 0,
      earnedBasic: Number(payroll.basic_earned) || 0,
      paidDays: payroll.present_days || 0,
      totalDays: Math.max(1, payroll.present_days || 30),
      weekoffs: payroll.week_off_days || 0,
      paidHols: payroll.paid_holiday_days || 0,
      presentDays: payroll.present_days || 0,
      basic: Number(payroll.basic_earned) || 0
    };
    const isPaid = payroll.status === 'paid' || paidIds.has(s.id);
    const isEdit = editSalEmpId === s.id;
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: s.id
    }, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
      className: "av-row"
    }, /*#__PURE__*/React.createElement(Av, {
      name: s.name,
      size: 26,
      r: 7
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: 11
      }
    }, s.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 9,
        color: 'var(--t2)'
      }
    }, s.role)))), /*#__PURE__*/React.createElement("td", {
      style: {
        fontFamily: 'monospace',
        fontSize: 11
      }
    }, "\u20B9", (salaryFallback.basic || 0).toLocaleString()), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        fontWeight: 700
      }
    }, salaryFallback.presentDays || 0), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        color: 'var(--t3)'
      }
    }, "/", sal.totalDays || 31, "d")), /*#__PURE__*/React.createElement("td", null, sal.lopAmt > 0 ? /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--red)',
        fontFamily: 'monospace',
        fontSize: 11
      }
    }, "-\u20B9", sal.lopAmt.toLocaleString(), " ", /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 9,
        color: 'var(--t3)'
      }
    }, "(", sal.lopDays, "d)")) : /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--t3)',
        fontSize: 11
      }
    }, "Nil")), /*#__PURE__*/React.createElement("td", null, reimbAmt > 0 ? /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--grn)',
        fontFamily: 'monospace',
        fontSize: 11
      }
    }, "+\u20B9", reimbAmt.toLocaleString()) : /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--t3)',
        fontSize: 11
      }
    }, "\u2014")), /*#__PURE__*/React.createElement("td", {
      style: {
        fontFamily: 'monospace',
        fontSize: 14,
        fontWeight: 800,
        color: 'var(--t1)'
      }
    }, "\u20B9", sal.payable.toLocaleString()), /*#__PURE__*/React.createElement("td", null, isPaid ? /*#__PURE__*/React.createElement("span", {
      className: "bg bg-appr",
      style: {
        fontSize: 9
      }
    }, "Paid") : /*#__PURE__*/React.createElement("span", {
      className: "bg bg-pend",
      style: {
        fontSize: 9
      }
    }, "Pending")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 5
      }
    }, /*#__PURE__*/React.createElement("button", {
      className: "btn bs btn-sm",
      style: {
        fontSize: 10,
        padding: '3px 7px'
      },
      onClick: () => setEditSalEmpId(isEdit ? null : s.id)
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "edit",
      size: 11
    }), isEdit ? 'Close' : 'Edit'), !isPaid && /*#__PURE__*/React.createElement("button", {
      className: "btn btn-sm",
      style: {
        background: t.acc,
        color: '#fff',
        fontSize: 10,
        padding: '3px 8px'
      },
      onClick: async () => {
        if (payroll) {
          try {
            const res = await fetch(`/payroll/${payroll.id}/mark-paid`, {
              method: 'PUT',
              credentials: 'include'
            });
            if (res.ok) {
              setSaPayrollList(list => list.map(item => item.id === payroll.id ? { ...item, status: 'paid' } : item));
            }
          } catch (error) {
            console.error('Failed to mark payroll paid:', error);
          }
        }
        setPaidIds(p => new Set([...p, s.id]));
        addActivity('Super Admin', 'Super Admin', `processed salary for ${s.name}`, `₹${sal.payable.toLocaleString()} · ${payrollMonth}`, 'salary', 'var(--grn)');
        addEmpNotif(s.name, {
          type: 'salary',
          title: 'Salary Credited',
          body: `Your salary of ₹${sal.payable.toLocaleString()} for ${payrollMonth} has been processed.`,
          time: 'Just now',
          color: 'var(--grn)'
        });
      }
    }, "Pay"), /*#__PURE__*/React.createElement("button", {
      className: "btn bs btn-sm",
      style: {
        fontSize: 10,
        padding: '3px 7px'
      },
      onClick: () => setShowPayslip({
        empData: s,
        salData: sd,
        month: 3,
        year: 2026
      })
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "doc",
      size: 11
    }), "Slip", filteredStaff.length === 0 && /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
      colSpan: 8,
      style: {
        textAlign: 'center',
        color: 'var(--t3)',
        padding: 24
      }
    }, "No employees found in Payroll. Add staff or configure salary settings.")), )))), isEdit && /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
      colSpan: 8,
      style: {
        padding: '0 13px 13px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'var(--s2)',
        borderRadius: 10,
        padding: '14px',
        border: '1px solid var(--br)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        fontWeight: 700,
        color: 'var(--t2)',
        marginBottom: 10
      }
    }, "Edit Salary Components for ", s.name), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4,1fr)',
        gap: 8,
        marginBottom: 10
      }
    }, [['basic', 'Basic Salary'], ['hra', 'HRA'], ['da', 'DA'], ['bonus', 'Bonus'], ['overtime', 'Overtime'], ['incentive', 'Incentive']].map(([k, label]) => /*#__PURE__*/React.createElement("div", {
      key: k
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 9,
        color: 'var(--t3)',
        fontWeight: 700,
        textTransform: 'uppercase',
        marginBottom: 3
      }
    }, label), /*#__PURE__*/React.createElement("input", {
      className: "f-in",
      style: {
        padding: '6px 9px',
        fontSize: 12
      },
      type: "number",
      value: sd[k] || 0,
      onChange: e => setSalaryData(d => ({
        ...d,
        [s.id]: {
          ...(d[s.id] || {}),
          month: sd.month || 3,
          year: sd.year || 2026,
          presentDays: sd.presentDays || 0,
          [k]: Number(e.target.value)
        }
      }))
    })))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4,1fr)',
        gap: 8,
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 9,
        color: 'var(--t3)',
        fontWeight: 700,
        textTransform: 'uppercase',
        marginBottom: 3
      }
    }, "Present Days"), /*#__PURE__*/React.createElement("input", {
      className: "f-in",
      style: {
        padding: '6px 9px',
        fontSize: 12
      },
      type: "number",
      value: sd.presentDays || 0,
      onChange: e => setSalaryData(d => ({
        ...d,
        [s.id]: {
          ...(d[s.id] || {}),
          presentDays: Number(e.target.value)
        }
      }))
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 9,
        color: 'var(--t3)',
        fontWeight: 700,
        textTransform: 'uppercase',
        marginBottom: 3
      }
    }, "Month"), /*#__PURE__*/React.createElement("select", {
      className: "f-in f-sel",
      style: {
        padding: '6px 9px',
        fontSize: 12
      },
      value: sd.month || 3,
      onChange: e => setSalaryData(d => ({
        ...d,
        [s.id]: {
          ...(d[s.id] || {}),
          month: Number(e.target.value)
        }
      }))
    }, ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => /*#__PURE__*/React.createElement("option", {
      key: i,
      value: i + 1
    }, m)))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'flex-end',
        gridColumn: 'span 2'
      }
    }, /*#__PURE__*/React.createElement("button", {
      className: "btn btn-full",
      style: {
        background: t.acc,
        color: '#fff'
      },
      onClick: () => setEditSalEmpId(null)
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "check",
      size: 13,
      color: "#fff"
    }), "Save"))), (() => {
      const preview = calcSalary(sd, reimbAmt, salarySettings);
      return /*#__PURE__*/React.createElement("div", {
        style: {
          background: 'rgba(0,168,132,0.07)',
          borderRadius: 8,
          padding: '9px 12px',
          fontSize: 12,
          color: 'var(--t1)'
        }
      }, /*#__PURE__*/React.createElement("b", null, "Preview:"), " \u20B9", sd.basic || 0, " \xF7 ", preview.totalDays, "d \xD7 (", sd.presentDays || 0, " + ", preview.weekoffs, "wo + ", preview.paidHols, "h) = ", /*#__PURE__*/React.createElement("b", null, "\u20B9", (preview.earnedBasic || 0).toLocaleString()), " + Reimb \u20B9", reimbAmt.toLocaleString(), " = ", /*#__PURE__*/React.createElement("b", {
        style: {
          color: 'var(--teal)'
        }
      }, "\u20B9", preview.payable.toLocaleString()));
    })()))));
  })))))), /*#__PURE__*/React.createElement("div", {
    className: `pg ${page === 'pend' ? 'on' : ''}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "ph"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "pt"
  }, "Pending Requests"), /*#__PURE__*/React.createElement("div", {
    className: "ps"
  }, totalPending, " requests awaiting action"))), /*#__PURE__*/React.createElement("div", {
    className: "tabs",
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: `tab ${pendTab === 'leave' ? 'on' : ''}`,
    onClick: () => setPendTab('leave')
  }, "Leave ", pendingLeaves > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      background: 'var(--red)',
      color: '#fff',
      borderRadius: 10,
      fontSize: 9,
      padding: '1px 5px',
      marginLeft: 4
    }
  }, pendingLeaves)), /*#__PURE__*/React.createElement("div", {
    className: `tab ${pendTab === 'reimb' ? 'on' : ''}`,
    onClick: () => setPendTab('reimb')
  }, "Reimbursement ", pendingReimb > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      background: 'var(--red)',
      color: '#fff',
      borderRadius: 10,
      fontSize: 9,
      padding: '1px 5px',
      marginLeft: 4
    }
  }, pendingReimb))), pendTab === 'leave' && globalLeaves.map(r => /*#__PURE__*/React.createElement("div", {
    key: r.id,
    className: "lrc"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lrc-top"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "av-row",
    style: {
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement(Av, {
    name: r.name,
    size: 28,
    r: 7
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "lrc-nm"
  }, r.name), /*#__PURE__*/React.createElement("div", {
    className: "lrc-ty"
  }, r.type, " \xB7 ", r.days, " day", r.days !== 1 ? 's' : '', " \xB7 ", r.from, "\u2013", r.to)))), /*#__PURE__*/React.createElement("span", {
    className: `bg ${r.status === 'pending' ? 'bg-pend' : r.status === 'approved' ? 'bg-appr' : 'bg-rej'}`,
    style: {
      fontSize: 9
    }
  }, r.status.charAt(0).toUpperCase() + r.status.slice(1))), /*#__PURE__*/React.createElement("div", {
    className: "lrc-rs"
  }, r.reason), r.rejReason && /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--rd)',
      borderRadius: 7,
      padding: '7px 10px',
      fontSize: 11,
      color: 'var(--red)',
      marginBottom: 8,
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "alert",
    size: 12,
    color: "var(--red)"
  }), "Rejection reason: ", r.rejReason), r.status === 'pending' && (rejectingId === r.id ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 600,
      color: 'var(--t2)',
      marginBottom: 5
    }
  }, "Rejection reason (sent to employee as notification):"), /*#__PURE__*/React.createElement("textarea", {
    className: "f-in",
    rows: 2,
    style: {
      resize: 'vertical',
      marginBottom: 7
    },
    placeholder: "Enter reason...",
    value: rejectReason,
    onChange: e => setRejectReason(e.target.value)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 7
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn bd2 btn-sm",
    onClick: async () => {
      if (!rejectReason.trim()) {
        alert('Please enter a rejection reason');
        return;
      }
      try {
        await fetch(`/leaves/${r.id}/reject`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ reason: rejectReason })
        });
        setGlobalLeaves(l => l.map(x => x.id === r.id ? {
          ...x,
          status: 'rejected',
          rejReason: rejectReason
        } : x));
        addActivity('Super Admin', 'Super Admin', `rejected leave for ${r.name}`, r.type, 'leave', 'var(--red)');
        addEmpNotif(r.name, {
          type: 'leave_rej',
          title: 'Leave Request Rejected',
          body: `Your ${r.type} (${r.from}–${r.to}) was rejected. Reason: ${rejectReason}`,
          time: 'Just now',
          color: 'var(--red)'
        });
        setRejectingId(null);
        setRejectReason('');
      } catch (e) { alert('Rejection failed'); }
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "x",
    size: 12
  }), "Confirm Reject"), /*#__PURE__*/React.createElement("button", {
    className: "btn bs btn-sm",
    onClick: () => {
      setRejectingId(null);
      setRejectReason('');
    }
  }, "Cancel"))) : /*#__PURE__*/React.createElement("div", {
    className: "lrc-acts"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-sm",
    style: {
      background: 'var(--grn)',
      color: '#fff'
    },
    onClick: async () => {
        try {
          await fetch(`/leaves/${r.id}/approve`, {
            method: 'POST',
            credentials: 'include'
          });
          setGlobalLeaves(l => l.map(x => x.id === r.id ? { ...x, status: 'approved' } : x));
          addActivity('Super Admin', 'Super Admin', `approved leave for ${r.name}`, `${r.type} · ${r.from}–${r.to}`, 'leave', 'var(--grn)');
          addEmpNotif(r.name, {
            type: 'leave_appr',
            title: 'Leave Approved',
            body: `Your ${r.type} (${r.from}–${r.to}) has been approved.`,
            time: 'Just now',
            color: 'var(--grn)'
          });
        } catch (e) { alert('Approval failed'); }
      }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "check",
    size: 12,
    color: "#fff"
  }), "Approve"), /*#__PURE__*/React.createElement("button", {
    className: "btn bd2 btn-sm",
    onClick: () => {
      setRejectingId(r.id);
      setRejectReason('');
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "x",
    size: 12
  }), "Reject"))))), pendTab === 'reimb' && globalReimb.map(r => /*#__PURE__*/React.createElement("div", {
    key: r.id,
    className: "reimb-card"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "av-row",
    style: {
      marginBottom: 5
    }
  }, /*#__PURE__*/React.createElement(Av, {
    name: r.name,
    size: 28,
    r: 7
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "lrc-nm"
  }, r.name), /*#__PURE__*/React.createElement("div", {
    className: "lrc-ty"
  }, r.category, " \xB7 ", r.date))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: 'var(--t1)',
      marginLeft: 37
    }
  }, r.title)), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 800,
      color: 'var(--grn)'
    }
  }, "\u20B9", r.amount.toLocaleString()), /*#__PURE__*/React.createElement("span", {
    className: `bg ${r.status === 'pending' ? 'bg-pend' : r.status === 'approved' ? 'bg-appr' : 'bg-rej'}`,
    style: {
      fontSize: 9,
      display: 'block',
      marginTop: 4
    }
  }, r.status.charAt(0).toUpperCase() + r.status.slice(1)))), r.rejReason && /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--rd)',
      borderRadius: 7,
      padding: '7px 10px',
      fontSize: 11,
      color: 'var(--red)',
      marginBottom: 8,
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "alert",
    size: 12,
    color: "var(--red)"
  }), "Rejection reason: ", r.rejReason), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginBottom: 8,
      padding: '7px 10px',
      background: 'var(--s2)',
      borderRadius: 7,
      border: '1px solid var(--br)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "doc",
    size: 13,
    color: "var(--t2)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: 'var(--t2)',
      flex: 1
    }
  }, "Receipt attached"), /*#__PURE__*/React.createElement("button", {
    style: {
      background: 'none',
      border: 'none',
      color: 'var(--blu)',
      fontSize: 11,
      cursor: 'pointer',
      fontWeight: 600,
      fontFamily: 'Inter',
      display: 'flex',
      alignItems: 'center',
      gap: 3
    },
    onClick: () => setViewReceiptData({
      url: r.receipt,
      title: r.title
    })
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "eye",
    size: 12,
    color: "var(--blu)"
  }), "View Receipt")), r.status === 'pending' && (rejectingId === `reimb_${r.id}` ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 600,
      color: 'var(--t2)',
      marginBottom: 5
    }
  }, "Rejection reason (will notify employee):"), /*#__PURE__*/React.createElement("textarea", {
    className: "f-in",
    rows: 2,
    style: {
      resize: 'vertical',
      marginBottom: 7
    },
    placeholder: "Enter reason...",
    value: rejectReason,
    onChange: e => setRejectReason(e.target.value)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 7
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn bd2 btn-sm",
    onClick: async () => {
      if (!rejectReason.trim()) {
        alert('Enter a rejection reason');
        return;
      }
      try {
        await fetch(`/reimbursements/${r.id}/reject`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ reason: rejectReason })
        });
        setGlobalReimb(rr => rr.map(x => x.id === r.id ? {
          ...x,
          status: 'rejected',
          rejReason: rejectReason
        } : x));
        addEmpNotif(r.name, {
          type: 'reimb_rej',
          title: 'Reimbursement Rejected',
          body: `Your reimbursement "${r.title}" (₹${r.amount}) was rejected. Reason: ${rejectReason}`,
          time: 'Just now',
          color: 'var(--red)'
        });
        addActivity('Super Admin', 'Super Admin', `rejected reimb for ${r.name}`, r.title, 'reimb', 'var(--red)');
        setRejectingId(null);
        setRejectReason('');
      } catch (e) { alert('Rejection failed'); }
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "x",
    size: 12
  }), "Confirm Reject"), /*#__PURE__*/React.createElement("button", {
    className: "btn bs btn-sm",
    onClick: () => {
      setRejectingId(null);
      setRejectReason('');
    }
  }, "Cancel"))) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 7
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-sm",
    style: {
      background: 'var(--grn)',
      color: '#fff'
    },
    onClick: async () => {
      try {
        await fetch(`/reimbursements/${r.id}/approve`, {
          method: 'PUT',
          credentials: 'include'
        });
        setGlobalReimb(rr => rr.map(x => x.id === r.id ? {
          ...x,
          status: 'approved'
        } : x));
        addActivity('Super Admin', 'Super Admin', `approved reimb for ${r.name}`, `${r.title} · ₹${r.amount}`, 'reimb', 'var(--grn)');
        addEmpNotif(r.name, {
          type: 'reimb_appr',
          title: 'Reimbursement Approved',
          body: `Your reimbursement "${r.title}" of ₹${r.amount.toLocaleString()} is approved and added to your salary.`,
          time: 'Just now',
          color: 'var(--grn)'
        });
      } catch (e) { alert('Approval failed'); }
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "check",
    size: 12,
    color: "#fff"
  }), "Approve \u20B9", r.amount.toLocaleString()), /*#__PURE__*/React.createElement("button", {
    className: "btn bd2 btn-sm",
    onClick: () => {
      setRejectingId(`reimb_${r.id}`);
      setRejectReason('');
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "x",
    size: 12
  }), "Reject")))))), /*#__PURE__*/React.createElement("div", {
    className: `pg ${page === 'settings' ? 'on' : ''}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "ph"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "pt"
  }, "Settings"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      overflowX: 'auto',
      paddingBottom: 10,
      borderBottom: '1px solid var(--d2)'
    }
  }, [{
    id: 'att',
    ic: 'calendar',
    l: 'Attendance Settings'
  }, {
    id: 'salary',
    ic: 'dollar',
    l: 'Salary Settings'
  }, {
    id: 'holiday',
    ic: 'gift',
    l: 'Holidays & Week Off'
  }, {
    id: 'departments',
    ic: 'building',
    l: 'Departments'
  }, {
    id: 'location',
    ic: 'map_pin',
    l: 'Location & Geofence'
  }, {
    id: 'users',
    ic: 'users',
    l: 'Users & Permissions'
  }, {
    id: 'company',
    ic: 'building',
    l: 'Company Settings'
  }, {
    id: 'billing',
    ic: 'bank',
    l: 'Billing'
  }, {
    id: 'more',
    ic: 'settings',
    l: 'More Settings'
  }].map(s => /*#__PURE__*/React.createElement("button", {
    key: s.id,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '8px 14px',
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      borderBottom: settingsSub === s.id ? `2px solid ${t.acc}` : '2px solid transparent',
      color: settingsSub === s.id ? t.acc : 'var(--t2)',
      fontSize: 12,
      fontWeight: settingsSub === s.id ? 600 : 400,
      whiteSpace: 'nowrap',
      transition: 'color 0.2s'
    },
    onClick: () => setSettingsSub(s.id)
  }, /*#__PURE__*/React.createElement(Icon, {
    n: s.ic,
    size: 14,
    color: settingsSub === s.id ? t.acc : 'var(--t2)'
  }), s.l))), /*#__PURE__*/React.createElement("div", {
    className: "cd"
  }, settingsSub === 'location' && /*#__PURE__*/React.createElement(LocationSettings, {
    geoSettings: geoSettings,
    setGeoSettings: setGeoSettings
  }), settingsSub === 'salary' && /*#__PURE__*/React.createElement(SalarySettingsPanel, {
    salarySettings: salarySettings,
    setSalarySettings: setSalarySettings
  }), settingsSub === 'departments' && /*#__PURE__*/React.createElement("div", {
    className: "pg-sub"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cd-h"
  }, /*#__PURE__*/React.createElement("span", {
    className: "cd-t"
  }, "Departments"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-sm",
    style: {
      background: t.acc,
      color: '#fff',
      pointerEvents: 'auto',
      position: 'relative',
      zIndex: 9999
    },
    onClick: handleOpenAddDept,
    onMouseDown: handleOpenAddDept,
    onTouchStart: handleOpenAddDept
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "plus",
    size: 13,
    color: "#fff"
  }), "Add Dept")), /*#__PURE__*/React.createElement("div", {
    className: "cd-b"
  }, deptLoading ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 20,
      textAlign: 'center'
    }
  }, "Loading...") : depts.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 20,
      textAlign: 'center',
      color: 'var(--t3)'
    }
  }, "No departments found") : /*#__PURE__*/React.createElement("table", null, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Department Name"), /*#__PURE__*/React.createElement("th", null, "Week Off"), /*#__PURE__*/React.createElement("th", {
    style: {
      textAlign: 'right'
    }
  }, "Action"))), /*#__PURE__*/React.createElement("tbody", null, depts.map(d => /*#__PURE__*/React.createElement("tr", {
    key: d.id
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: 12
    }
  }, d.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: 'var(--t3)'
    }
  }, d.description || 'No description')), /*#__PURE__*/React.createElement("td", null, d.week_off_days.length > 0 ? d.week_off_days.map(day => dayNamesShort[day]).join(', ') : 'No fixed off'), /*#__PURE__*/React.createElement("td", {
    style: {
      textAlign: 'right'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      gap: 6,
      justifyContent: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn bs btn-sm",
    style: {
      padding: '4px 8px'
    },
    onClick: () => handleEditDept(d)
  }, "Edit"), /*#__PURE__*/React.createElement("button", {
    className: "btn bs btn-sm",
    style: {
      padding: '4px 8px'
    },
    onClick: () => handleDeleteDept(d)
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "trash",
    size: 12,
    color: "var(--red)"
  }))))))), showAddDept && /*#__PURE__*/React.createElement("div", {
    className: "modal-ov",
    onClick: e => e.target === e.currentTarget && setShowAddDept(false),
    style: {
      zIndex: 1000000
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-box",
    style: {
      maxWidth: 400
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "modal-title"
  }, isEditingDept ? 'Edit Department' : 'Create Department')), /*#__PURE__*/React.createElement("div", {
    className: "modal-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fg"
  }, /*#__PURE__*/React.createElement("label", {
    className: "fl"
  }, "Department Name"), /*#__PURE__*/React.createElement("input", {
    className: "f-in",
    placeholder: "eg. Marketing",
    value: newDept.name,
    onChange: e => setNewDept({
      ...newDept,
      name: e.target.value
    })
  })), /*#__PURE__*/React.createElement("div", {
    className: "fg"
  }, /*#__PURE__*/React.createElement("label", {
    className: "fl"
  }, "Description"), /*#__PURE__*/React.createElement("input", {
    className: "f-in",
    placeholder: "Optional",
    value: newDept.description,
    onChange: e => setNewDept({
      ...newDept,
      description: e.target.value
    })
  })), /*#__PURE__*/React.createElement("div", {
    className: "fg"
  }, /*#__PURE__*/React.createElement("label", {
    className: "fl"
  }, "Week Off Days"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: 4
    }
  }, dayNamesShort.map((day, i) => /*#__PURE__*/React.createElement("button", {
    key: day,
    className: `btn btn-sm ${newDept.week_off_days.includes(i) ? '' : 'bs'}`,
    style: newDept.week_off_days.includes(i) ? {
      background: t.acc,
      color: '#fff'
    } : {},
    onClick: () => toggleDay(i)
  }, day))))), /*#__PURE__*/React.createElement("div", {
    className: "modal-foot"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn bs btn-full",
    onClick: () => {
      setShowAddDept(false);
      setSelectedDept(null);
      setIsEditingDept(false);
      setNewDept({ name: '', description: '', week_off_days: [] });
    }
  }, "Cancel"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-full",
    style: {
      background: t.acc,
      color: '#fff'
    },
    onClick: handleSaveDept
  }, isEditingDept ? 'Update Department' : 'Save Department')))), settingsSub === 'att' && /*#__PURE__*/React.createElement(AttSettingsPanel, null), settingsSub === 'more' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "cd-h"
  }, /*#__PURE__*/React.createElement("span", {
    className: "cd-t"
  }, "More Settings")), /*#__PURE__*/React.createElement("div", {
    className: "shdr"
  }, "Notifications"), /*#__PURE__*/React.createElement("div", {
    className: "sr"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sic"
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "bell",
    size: 15,
    color: "var(--t2)"
  })), /*#__PURE__*/React.createElement("span", {
    className: "slb"
  }, "App Notifications"), /*#__PURE__*/React.createElement("label", {
    className: "tgl",
    style: {
      marginLeft: 'auto'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    defaultChecked: true
  }), /*#__PURE__*/React.createElement("span", {
    className: "ts"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "shdr"
  }, "Others"), [{
    ic: 'building',
    l: 'Your Companies'
  }, {
    ic: 'trash',
    l: 'Delete All Staff',
    m: 'danger'
  }, {
    ic: 'doc',
    l: 'Terms & Conditions'
  }, {
    ic: 'lock',
    l: 'Privacy Policy'
  }, {
    ic: 'logout',
    l: 'Logout'
  }].map(s => /*#__PURE__*/React.createElement("div", {
    key: s.l,
    className: "sr",
    style: s.m === 'danger' ? {
      background: 'rgba(229,62,62,.03)'
    } : {}
  }, /*#__PURE__*/React.createElement("div", {
    className: "sic",
    style: s.m === 'danger' ? {
      background: 'var(--rd)',
      border: '1px solid rgba(229,62,62,.2)'
    } : {}
  }, /*#__PURE__*/React.createElement(Icon, {
    n: s.ic,
    size: 15,
    color: s.m === 'danger' ? 'var(--red)' : 'var(--t2)'
  })), /*#__PURE__*/React.createElement("span", {
    className: `slb ${s.m === 'danger' ? 'dng' : ''}`
  }, s.l), /*#__PURE__*/React.createElement(Icon, {
    n: "chevron_right",
    size: 13,
    color: s.m === 'danger' ? 'var(--red)' : 'var(--t3)'
  }))), /*#__PURE__*/React.createElement("div", {
    className: "cc-box"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cc-l"
  }, "Company Code"), /*#__PURE__*/React.createElement("div", {
    className: "cc-v"
  }, "HGZ2Y6")), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      color: 'var(--t3)',
      fontSize: 10,
      paddingBottom: 12
    }
  }, "v-7.00")),
  settingsSub === "holiday" && /*#__PURE__*/React.createElement(HolidaySettingsPanel, {
    salarySettings: salarySettings,
    setSalarySettings: setSalarySettings,
    accentColor: t.acc,
    yearlyHolidays: yearlyHolidays,
    setYearlyHolidays: setYearlyHolidays
  }), !['att', 'salary', 'holiday', 'more', 'location', 'departments'].includes(settingsSub) && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '50px 20px',
      textAlign: 'center',
      color: 'var(--t3)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "settings",
    size: 28,
    color: "var(--t3)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--t2)'
    }
  }, "Configuration coming soon")))), showAttModal && /*#__PURE__*/React.createElement(AttendanceModal, {
    onClose: () => setShowAttModal(false),
    userName: user.name,
    geoSettings: geoSettings,
    currentStatus: hrPunchStatus,
    branchId: user.branch?.id || 'b1',
    onSuccess: (type, time, addr) => {
      setHrPunchStatus(type);
      alert(`Success: Punched ${type === 'in' ? 'In' : 'Out'} at ${time}`);
    }
  })))))))); 
};

// ─── HR PANEL ─────────────────────────────────────────────────────────────
const HRPanel = ({
  user,
  onLogout,
  geoSettings,
  globalStaff,
  setGlobalStaff,
  globalLeaves,
  setGlobalLeaves,
  globalActivity,
  setGlobalActivity,
  globalBranches,
  globalReimb,
  setGlobalReimb,
  empNotifs,
  addEmpNotif,
  salarySettings,
  setSalarySettings,
  salaryData,
  setSalaryData,
  yearlyHolidays,
  setYearlyHolidays
}) => {
  const t = THEME.hr;
  const [page, setPage] = useState('home');
  const [emp, setEmp] = useState(null);
  const [sideOpen, setSideOpen] = useState(false);
  const [showAttModal, setShowAttModal] = useState(false);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [pendTab, setPendTab] = useState('leave');
  const [hrRejectingId, setHrRejectingId] = useState(null);
  const [hrRejectReason, setHrRejectReason] = useState('');
  const [hrViewReceipt, setHrViewReceipt] = useState(null);
  const [hrSettingsSub, setHrSettingsSub] = useState('holiday');
  const [hrPaidIds, setHrPaidIds] = useState(new Set());
  const [hrEditSalId, setHrEditSalId] = useState(null);
  const [hrPayrollMonth, setHrPayrollMonth] = useState('March 2026');
  const [hrShowPayslip, setHrShowPayslip] = useState(null);
  const [hrSearch, setHrSearch] = useState('');
  const [hrPunchStatus, setHrPunchStatus] = useState('out');
  const [hrPunchLog, setHrPunchLog] = useState([]);
  const [hrAttData, setHrAttData] = useState({});
  const [hrAttendanceMonth, setHrAttendanceMonth] = useState(new Date().getMonth() + 1);
  const [hrAttendanceYear, setHrAttendanceYear] = useState(new Date().getFullYear());
  const [hrAttSummary, setHrAttSummary] = useState({
    present: 0,
    halfDay: 0,
    absent: 0,
    weekOff: 0,
    holiday: 0,
    leave: 0,
    paidLeave: 0,
    unpaidLeave: 0
  });
  const [hrAttLoading, setHrAttLoading] = useState(false);
  const [payrollList, setPayrollList] = useState([]);
  const [payLoading, setPayLoading] = useState(false);

  const mapHrAttendanceStatus = useCallback(status => {
    switch (status) {
      case 'present':
        return 'p';
      case 'half_day':
        return 'h';
      case 'week_off':
        return 'w';
      case 'holiday':
        return 'hol';
      case 'paid_leave':
        return 'pl';
      case 'unpaid_leave':
        return 'ul';
      case 'future':
        return 'f';
      case 'absent':
      case 'absent_pending':
      default:
        return 'a';
    }
  }, []);
  const hrMonthLabel = new Date(hrAttendanceYear, hrAttendanceMonth - 1, 1).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric'
  });
  const changeHrAttendanceMonth = delta => {
    const nextDate = new Date(hrAttendanceYear, hrAttendanceMonth - 1 + delta, 1);
    setHrAttendanceYear(nextDate.getFullYear());
    setHrAttendanceMonth(nextDate.getMonth() + 1);
  };
  const fetchHrAttendance = useCallback(async () => {
    setHrAttLoading(true);
    try {
      const statusRes = await fetch(`/attendance/today`, {
        credentials: 'include'
      });
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setHrPunchStatus(statusData.hasPunchedIn && !statusData.hasPunchedOut ? 'in' : 'out');
      }
      const historyRes = await fetch(`/attendance/my?month=${hrAttendanceMonth}&year=${hrAttendanceYear}`, {
        credentials: 'include'
      });
      if (historyRes.ok) {
        const {
          days = [],
          summary = {}
        } = await historyRes.json();
        const processedAttData = {};
        days.forEach(day => {
          processedAttData[String(day.day).padStart(2, '0')] = day;
        });
        setHrAttData(processedAttData);
        setHrAttSummary({
          present: summary.present || 0,
          halfDay: summary.halfDay || 0,
          absent: summary.absent || 0,
          weekOff: summary.weekOff || 0,
          holiday: summary.holiday || 0,
          leave: summary.leave || 0,
          paidLeave: summary.paidLeave || 0,
          unpaidLeave: summary.unpaidLeave || 0
        });
      }
    } catch (error) {
      console.error('Error fetching HR attendance:', error);
    } finally {
      setHrAttLoading(false);
    }
  }, [hrAttendanceMonth, hrAttendanceYear]);
  useEffect(() => {
    fetchHrAttendance();
  }, [fetchHrAttendance]);
  const downloadHrAttendanceReport = () => {
    const rows = Object.values(hrAttData).sort((a, b) => Number(a.day || 0) - Number(b.day || 0)).map(day => [day.date, day.status, day.punchIn ? new Date(day.punchIn).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    }) : '', day.punchOut ? new Date(day.punchOut).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    }) : '', day.workingHours || '']);
    const csv = [['Date', 'Status', 'Punch In', 'Punch Out', 'Working Hours'], ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hr-attendance-${hrAttendanceMonth}-${hrAttendanceYear}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Fetch payroll for selected month
  useEffect(() => {
    if (page === 'payroll') {
      const [mName, y] = hrPayrollMonth.split(' ');
      const m = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].indexOf(mName) + 1;
      setPayLoading(true);
      fetch(`/payroll?month=${m}&year=${y}`, { credentials: 'include' })
        .then(r => r.json())
        .then(data => setPayrollList(data))
        .catch(e => console.error(e))
        .finally(() => setPayLoading(false));
    }
  }, [page, hrPayrollMonth]);

  const handlePaySalary = async (empId, amount) => {
    try {
      const [mName, y] = hrPayrollMonth.split(' ');
      const m = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].indexOf(mName) + 1;
      
      const res = await fetch(`${API_BASE}/payroll/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ employeeId: empId, month: m, year: Number(y) })
      });
      
      if (res.ok) {
        const payroll = await res.json();
        await fetch(`/payroll/${payroll.id}/mark-paid`, {
          method: 'PUT',
          credentials: 'include'
        });
        
        setHrPaidIds(p => new Set([...p, empId]));
        addActivity('HR Manager', 'HR', `processed salary for staff`, `₹${amount.toLocaleString()} · ${hrPayrollMonth}`, 'salary', 'var(--grn)');
      }
    } catch (e) { alert('Payment failed'); }
  };

  const navItems = [{
    id: 'home',
    ic: 'home',
    l: 'Dashboard'
  }, {
    id: 'my-att',
    ic: 'calendar',
    l: 'My Attendance'
  }, {
    id: 'emp',
    ic: 'users',
    l: 'Employees'
  }, {
    id: 'att',
    ic: 'calendar',
    l: 'Attendance'
  }, {
    id: 'pend',
    ic: 'clipboard',
    l: 'Leave Requests'
  }, {
    id: 'payroll',
    ic: 'dollar',
    l: 'Payroll'
  }, {
    id: 'reports',
    ic: 'chart',
    l: 'Reports'
  }, {
    id: 'settings',
    ic: 'settings',
    l: 'Settings'
  }];

  const go = p => {
    setPage(p);
    if (p !== 'emp-detail') setEmp(null);
    setSideOpen(false);
  };

  const addActivity = (who, role, action, detail, type, color) => {
    setGlobalActivity(a => [{
      id: Date.now(),
      who,
      role,
      action,
      detail,
      when: 'Just now',
      type,
      color
    }, ...a.slice(0, 19)]);
  };

  const handleAddStaff = async data => {
    try {
      const response = await fetch(`${API_BASE}/employees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const newStaff = await response.json();
        setGlobalStaff(s => [...s, {
          ...newStaff,
          name: newStaff.name,
          email: newStaff.email,
          role: newStaff.designation || newStaff.role,
          dept: newStaff.department?.name || '—',
          branch: newStaff.branch?.id || 'b1'
        }]);
        addActivity('HR Manager', 'HR', `added new staff ${newStaff.name}`, `${newStaff.designation || newStaff.role} · ${newStaff.department?.name || '—'}`, 'staff', 'var(--pur)');
        setShowAddStaff(false);
        return { success: true, email: newStaff.email };
      } else {
        const err = await response.json();
        return { success: false, message: err.message || 'Failed to add staff' };
      }
    } catch (error) {
      console.error('Error adding staff:', error);
      return { success: false, message: 'Network error while adding staff' };
    }
  };

  const pendingLeaves = globalLeaves.filter(r => r.status === 'pending').length;
  const pendingReimb = globalReimb.filter(r => r.status === 'pending').length;

  // Scroll lock for HR Panel modal
  React.useEffect(() => {
    if (showAddStaff) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = scrollbarWidth + 'px';
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [showAddStaff]);
  
  return /*#__PURE__*/React.createElement("div", {
    className: "layout"
  }, showAttModal && /*#__PURE__*/React.createElement(AttendanceModal, {
    user: user,
    onClose: () => setShowAttModal(false),
    userName: user.name,
    geoSettings: geoSettings,
    currentStatus: hrPunchStatus,
    onSuccess: async (type, time, addr) => {
      setHrPunchStatus(type);
      const today = new Date();
      const dayKey = String(today.getDate()).padStart(2, '0');
      const entry = {
        id: Date.now(),
        type,
        time,
        addr,
        date: 'Today'
      };
      setHrPunchLog(l => [entry, ...l]);
      // Update attendance data for calendar
      setHrAttData(d => ({
        ...d,
        [dayKey]: {
          ...(d[dayKey] || {}),
          [type === 'in' ? 'punchIn' : 'punchOut']: { time, addr },
          note: d[dayKey]?.note || ''
        }
      }));
      addActivity('HR Manager', 'HR', `marked ${type === 'in' ? 'Punch In' : 'Punch Out'}`, `${time} · ${addr}`, 'punch', type === 'in' ? 'var(--grn)' : 'var(--red)');
      
      await fetchHrAttendance();
    }
  }), showAddStaff && /*#__PURE__*/React.createElement(AddStaffModal, {
    onClose: () => setShowAddStaff(false),
    onAdd: handleAddStaff,
    branches: globalBranches,
    accentColor: t.acc
  }), hrShowPayslip && /*#__PURE__*/React.createElement(PayslipModal, {
    onClose: () => setHrShowPayslip(null),
    empData: hrShowPayslip.empData,
    salData: hrShowPayslip.salData,
    salSettings: salarySettings,
    month: hrShowPayslip.month,
    year: hrShowPayslip.year,
    globalReimb: globalReimb
  }), sideOpen && /*#__PURE__*/React.createElement("div", {
    className: "mob-overlay on",
    onClick: () => setSideOpen(false)
  }), /*#__PURE__*/React.createElement("aside", {
    className: "sb",
    style: sideOpen ? {
      transform: 'translateX(0)'
    } : {}
  }, /*#__PURE__*/React.createElement("div", {
    className: "sb-logo"
  }, /*#__PURE__*/React.createElement("div", {
    className: "logo-m",
    style: {
      background: t.logoGrad,
      boxShadow: t.logoShadow
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "users",
    size: 18,
    color: "#fff"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "logo-n"
  }, "City Homes"), /*#__PURE__*/React.createElement("div", {
    className: "logo-s"
  }, /*#__PURE__*/React.createElement("span", {
    className: "role-tag",
    style: {
      background: t.tagBg,
      color: t.tagColor
    }
  }, "HR Panel")))), /*#__PURE__*/React.createElement("div", {
    className: "nav"
  }, /*#__PURE__*/React.createElement("div", {
    className: "nl"
  }, "Main"), navItems.map(n => /*#__PURE__*/React.createElement("div", {
    key: n.id,
    className: `ni ${page === n.id || page === 'emp-detail' && n.id === 'emp' ? 'active' : ''}`,
    style: page === n.id || page === 'emp-detail' && n.id === 'emp' ? {
      background: t.accDim,
      color: t.acc
    } : {},
    onClick: () => go(n.id)
  }, /*#__PURE__*/React.createElement(Icon, {
    n: n.ic,
    size: 15,
    color: page === n.id ? t.acc : 'var(--t2)'
  }), /*#__PURE__*/React.createElement("span", null, n.l), n.id === 'pend' && pendingLeaves + pendingReimb > 0 && /*#__PURE__*/React.createElement("span", {
    className: "nb nb-r"
  }, pendingLeaves + pendingReimb))), /*#__PURE__*/React.createElement("div", {
    className: "nl",
    style: {
      marginTop: 5
    }
  }, "HR Tools"), [['announce', 'Announcements'], ['training', 'Training']].map(([ic, l]) => /*#__PURE__*/React.createElement("div", {
    key: l,
    className: "ni"
  }, /*#__PURE__*/React.createElement(Icon, {
    n: ic,
    size: 15,
    color: "var(--t2)"
  }), /*#__PURE__*/React.createElement("span", null, l)))), /*#__PURE__*/React.createElement("div", {
    className: "sb-bot"
  }, /*#__PURE__*/React.createElement("div", {
    className: "uc"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ua",
    style: {
      background: t.logoGrad
    }
  }, t.tag), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "un"
  }, user.name), /*#__PURE__*/React.createElement("div", {
    className: "ur"
  }, user.company))), /*#__PURE__*/React.createElement("button", {
    className: "logout-btn",
    onClick: onLogout
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "logout",
    size: 14,
    color: "var(--red)"
  }), "Logout"))), /*#__PURE__*/React.createElement("div", {
    className: "tb"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hamb",
    onClick: () => setSideOpen(!sideOpen)
  }, /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("span", null)), /*#__PURE__*/React.createElement("div", {
    className: "tb-t"
  }, page === 'emp-detail' ? emp?.name : navItems.find(n => n.id === page)?.l || 'HR Dashboard'), /*#__PURE__*/React.createElement("div", {
    className: "tb-s"
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "search",
    size: 13,
    color: "var(--t3)"
  }), /*#__PURE__*/React.createElement("input", {
    placeholder: "Search..."
  })), /*#__PURE__*/React.createElement("div", {
    className: "tb-r"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn",
    style: {
      background: t.acc,
      color: '#fff',
      fontSize: 12,
      fontWeight: 700,
      padding: '8px 14px',
      marginRight: 10
    },
    onClick: () => setShowAttModal(true)
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "clock",
    size: 14,
    color: "#fff"
  }), "Mark Attendance"), /*#__PURE__*/React.createElement("div", {
    className: "ib"
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "bell",
    size: 16,
    color: "var(--t2)"
  }), /*#__PURE__*/React.createElement("div", {
    className: "nd"
  })), /*#__PURE__*/React.createElement(Av, {
    name: user.name,
    size: 30,
    r: 8
  }))), /*#__PURE__*/React.createElement("div", {
    className: "main"
  }, page === 'emp-detail' && emp ? /*#__PURE__*/React.createElement("div", {
    className: "pg on"
  }, /*#__PURE__*/React.createElement(EmpDetail, {
    emp: emp,
    onBack: () => go('emp'),
    accentColor: t.acc,
    userRole: "hr",
    salaryData: salaryData,
    salarySettings: salarySettings,
    globalReimb: globalReimb,
    yearlyHolidays: yearlyHolidays,
    setSalaryData: setSalaryData,
    setGlobalActivity: setGlobalActivity
  })) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: `pg ${page === 'home' ? 'on' : ''}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "ph"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "pt"
  }, "HR Overview"), /*#__PURE__*/React.createElement("div", {
    className: "ps"
  }, "Saturday, 21 Mar 2026")), /*#__PURE__*/React.createElement("div", {
    className: "pa"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-sm",
    style: {
      background: t.acc,
      color: '#fff'
    },
    onClick: () => setShowAddStaff(true)
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "plus",
    size: 13,
    color: "#fff"
  }), "Add Staff"))), /*#__PURE__*/React.createElement("div", {
    className: "sg"
  }, [{
    l: 'Total Employees',
    v: globalStaff.length,
    c: t.acc,
    ic: 'users',
    t: 'Active',
    up: true
  }, {
    l: 'Present Today',
    v: globalStaff.filter(s => s.ls === 'in').length,
    c: 'var(--grn)',
    ic: 'check',
    t: 'Marked In',
    up: true
  }, {
    l: 'Leave Pending',
    v: pendingLeaves,
    c: 'var(--amb)',
    ic: 'clipboard',
    t: 'Awaiting approval',
    up: false
  }, {
    l: 'Payroll Due',
    v: '₹87K',
    c: 'var(--blu)',
    ic: 'dollar',
    t: 'This month',
    up: true
  }].map(s => /*#__PURE__*/React.createElement("div", {
    key: s.l,
    className: "sc"
  }, /*#__PURE__*/React.createElement("div", {
    className: "si",
    style: {
      background: `${s.c}18`
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: s.ic,
    size: 18,
    color: s.c
  })), /*#__PURE__*/React.createElement("div", {
    className: "sn",
    style: {
      color: s.c
    }
  }, s.v), /*#__PURE__*/React.createElement("div", {
    className: "sl"
  }, s.l), /*#__PURE__*/React.createElement("div", {
    className: `st ${s.up ? 'su' : 'sd'}`
  }, s.up ? '↑ ' : '↓ ', s.t)))), /*#__PURE__*/React.createElement("div", {
    className: "g2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cd"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cd-h"
  }, /*#__PURE__*/React.createElement("span", {
    className: "cd-t"
  }, "Staff Overview"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-sm",
    style: {
      background: t.acc,
      color: '#fff'
    },
    onClick: () => go('emp')
  }, "View All")), /*#__PURE__*/React.createElement("table", null, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Employee"), /*#__PURE__*/React.createElement("th", null, "Role"), /*#__PURE__*/React.createElement("th", null, "Status"))), /*#__PURE__*/React.createElement("tbody", null, globalStaff.slice(0, 5).map(s => /*#__PURE__*/React.createElement("tr", {
    key: s.id,
    onClick: () => {
      setEmp(s);
      setPage('emp-detail');
    }
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    className: "av-row"
  }, /*#__PURE__*/React.createElement(Av, {
    name: s.name,
    size: 26,
    r: 7
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 500,
      fontSize: 11
    }
  }, s.name))), /*#__PURE__*/React.createElement("td", {
    style: {
      fontSize: 11,
      color: 'var(--t2)'
    }
  }, s.role), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: `bg ${s.status === 'present' ? 'bg-p' : 'bg-a'}`,
    style: {
      fontSize: 9
    }
  }, s.status === 'present' ? 'Present' : 'Absent'))))))), /*#__PURE__*/React.createElement("div", {
    className: "cd"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cd-h"
  }, /*#__PURE__*/React.createElement("span", {
    className: "cd-t"
  }, "Leave Summary"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-sm",
    style: {
      background: t.acc,
      color: '#fff'
    },
    onClick: () => go('pend')
  }, "Manage")), /*#__PURE__*/React.createElement("div", {
    className: "cd-b"
  }, [['Pending', 'var(--amb)', pendingLeaves], ['Approved', `var(--grn)`, globalLeaves.filter(r => r.status === 'approved').length], ['Rejected', 'var(--red)', globalLeaves.filter(r => r.status === 'rejected').length]].map(([l, c, v]) => /*#__PURE__*/React.createElement("div", {
    key: l,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 0',
      borderBottom: '1px solid var(--br)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: 'var(--t2)'
    }
  }, l), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 800,
      color: c
    }
  }, v))))))), /*#__PURE__*/React.createElement("div", {
    className: `pg ${page === 'emp' ? 'on' : ''}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "ph"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "pt"
  }, "Employees"), /*#__PURE__*/React.createElement("div", {
    className: "ps"
  }, globalStaff.length, " staff members")), /*#__PURE__*/React.createElement("div", {
    className: "pa"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-sm",
    style: {
      background: t.acc,
      color: '#fff'
    },
    onClick: () => setShowAddStaff(true)
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "plus",
    size: 13,
    color: "#fff"
  }), "Add Staff"))), /*#__PURE__*/React.createElement("div", {
    className: "srch",
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "search",
    size: 14,
    color: "var(--t3)"
  }), /*#__PURE__*/React.createElement("input", {
    placeholder: "Search employees...",
    value: hrSearch,
    onChange: e => setHrSearch(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "cd"
  }, /*#__PURE__*/React.createElement("table", null, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Employee"), /*#__PURE__*/React.createElement("th", null, "Role"), /*#__PURE__*/React.createElement("th", null, "Dept"), /*#__PURE__*/React.createElement("th", null, "Status"))), /*#__PURE__*/React.createElement("tbody", null, globalStaff.filter(s => s.name.toLowerCase().includes(hrSearch.toLowerCase()) || s.role.toLowerCase().includes(hrSearch.toLowerCase())).map(s => /*#__PURE__*/React.createElement("tr", {
    key: s.id,
    onClick: () => {
      setEmp(s);
      setPage('emp-detail');
    }
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    className: "av-row"
  }, /*#__PURE__*/React.createElement(Av, {
    name: s.name,
    size: 26,
    r: 7
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: 11
    }
  }, s.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9,
      color: 'var(--t2)'
    }
  }, s.email)))), /*#__PURE__*/React.createElement("td", {
    style: {
      fontSize: 10,
      color: 'var(--t2)'
    }
  }, s.role), /*#__PURE__*/React.createElement("td", {
    style: {
      fontSize: 10,
      color: 'var(--t3)'
    }
  }, s.dept), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: `bg ${s.status === 'present' ? 'bg-p' : 'bg-a'}`,
    style: {
      fontSize: 9
    }
  }, s.status === 'present' ? 'P' : 'A')))))))), /*#__PURE__*/React.createElement("div", {
    className: `pg ${page === 'my-att' ? 'on' : ''}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "ph"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "pt"
  }, "My Attendance"), /*#__PURE__*/React.createElement("div", {
    className: "ps"
  }, hrMonthLabel, " · Your personal attendance")), /*#__PURE__*/React.createElement("div", {
    className: "pa"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn",
    style: {
      background: t.acc,
      color: '#fff',
      fontSize: 11,
      fontWeight: 700,
      padding: '7px 12px',
      borderRadius: 8,
      gap: 6
    },
    onClick: () => setShowAttModal(true)
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "clock",
    size: 13,
    color: "#fff"
  }), hrPunchStatus === 'out' ? 'Mark Attendance' : 'Punch Out'))), /*#__PURE__*/React.createElement("div", {
    className: "cal-sum"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cal-col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cal-n",
    style: {
      color: 'var(--grn)'
    }
  }, hrAttSummary.present), /*#__PURE__*/React.createElement("div", {
    className: "cal-l"
  }, "Present")), /*#__PURE__*/React.createElement("div", {
    className: "cal-col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cal-n",
    style: {
      color: 'var(--red)'
    }
  }, hrAttSummary.absent), /*#__PURE__*/React.createElement("div", {
    className: "cal-l"
  }, "Absent")), /*#__PURE__*/React.createElement("div", {
    className: "cal-col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cal-n",
    style: {
      color: 'var(--teal)'
    }
  }, hrAttSummary.holiday), /*#__PURE__*/React.createElement("div", {
    className: "cal-l"
  }, "Holiday")), /*#__PURE__*/React.createElement("div", {
    className: "cal-col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cal-n",
    style: {
      color: 'var(--amb)'
    }
  }, hrAttSummary.halfDay), /*#__PURE__*/React.createElement("div", {
    className: "cal-l"
  }, "Half Day")), /*#__PURE__*/React.createElement("div", {
    className: "cal-col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cal-n",
    style: {
      color: 'var(--pur)'
    }
  }, hrAttSummary.paidLeave), /*#__PURE__*/React.createElement("div", {
    className: "cal-l"
  }, "Paid Leave")), /*#__PURE__*/React.createElement("div", {
    className: "cal-col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cal-n",
    style: {
      color: 'var(--blu)'
    }
  }, hrAttSummary.weekOff), /*#__PURE__*/React.createElement("div", {
    className: "cal-l"
  }, "Week Off"))), /*#__PURE__*/React.createElement("div", {
    className: "cd"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
      flexWrap: 'wrap',
      padding: '12px 14px',
      borderBottom: '1px solid var(--br)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: 'var(--t1)'
    }
  }, "Attendance Calendar"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--t2)'
    }
  }, "Present, absent, holiday, leave and week off overview")), /*#__PURE__*/React.createElement("button", {
    className: "btn bs btn-sm",
    onClick: downloadHrAttendanceReport
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "download",
    size: 13
  }), "Download Report")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '12px 17px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "dnb dnl",
    style: {
      background: t.acc,
      width: 28,
      height: 28,
      fontSize: 16
    },
    onClick: () => changeHrAttendanceMonth(-1)
  }, "‹"), /*#__PURE__*/React.createElement("div", {
    className: "dl",
    style: {
      flex: 1,
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "calendar",
    size: 13,
    color: "var(--t2)"
  }), " ", hrMonthLabel), /*#__PURE__*/React.createElement("button", {
    className: "dnb dnr",
    style: {
      width: 28,
      height: 28,
      fontSize: 16
    },
    onClick: () => changeHrAttendanceMonth(1)
  }, "›")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 17px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "cg",
    style: {
      marginBottom: 8
    }
  }, ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => /*#__PURE__*/React.createElement("div", {
    key: d,
    className: "ch"
  }, d))), /*#__PURE__*/React.createElement("div", {
    className: "cg"
  }, Array.from({
    length: new Date(hrAttendanceYear, hrAttendanceMonth - 1, 1).getDay()
  }, (_, i) => /*#__PURE__*/React.createElement("div", {
    key: `e${i}`,
    className: "day de"
  })), Array.from({
    length: new Date(hrAttendanceYear, hrAttendanceMonth, 0).getDate()
  }, (_, i) => {
    const dayNum = i + 1,
      d = String(dayNum).padStart(2, '0');
    const dayData = hrAttData[d] || {};
    const st = mapHrAttendanceStatus(dayData.status || (new Date(hrAttendanceYear, hrAttendanceMonth - 1, dayNum) > new Date() ? 'future' : 'absent_pending'));
    const cls = {
      p: 'dp',
      a: 'da',
      h: 'dh',
      w: 'dw',
      hol: 'dhol',
      pl: 'dpl',
      ul: 'da',
      f: 'df'
    }[st] || 'dw';
    const monthText = new Date(hrAttendanceYear, hrAttendanceMonth - 1, dayNum).toLocaleDateString('en-GB', {
      month: 'short'
    });
    const lblMap = {
      p: 'PRESENT',
      a: 'ABSENT',
      h: 'HALF DAY',
      hol: 'HOLIDAY',
      w: 'WEEK OFF',
      pl: 'PAID LEAVE',
      ul: 'UNPAID LEAVE',
      f: ''
    };
    const lbl = lblMap[st] || '';
    return /*#__PURE__*/React.createElement("div", {
      key: d,
      className: `day ${cls}`
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'center',
        gap: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "day-num"
    }, d), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 9,
        fontWeight: 700,
        color: 'var(--t2)',
        textTransform: 'uppercase'
      }
    }, monthText)), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        marginTop: 2,
        fontSize: 8,
        fontWeight: 600,
        color: 'var(--t2)'
      }
    }, String(hrAttendanceYear)), lbl && /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        marginTop: 10,
        fontSize: 8.5,
        fontWeight: 700,
        color: st === 'p' ? 'var(--grn)' : st === 'a' || st === 'ul' ? 'var(--red)' : st === 'hol' ? 'var(--teal)' : st === 'pl' ? 'var(--pur)' : st === 'w' ? 'var(--blu)' : 'var(--amb)',
        textTransform: 'uppercase',
        letterSpacing: '.3px'
      }
    }, lbl), dayData.isLate && st === 'p' && /*#__PURE__*/React.createElement("span", {
      className: "dt-late"
    }, "LATE"));
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 17px 13px',
      borderTop: '1px solid var(--br)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 600,
      color: 'var(--t2)'
    }
  }, "Selected month: ", hrMonthLabel), /*#__PURE__*/React.createElement("button", {
    className: "btn bs btn-sm",
    onClick: downloadHrAttendanceReport
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "download",
    size: 13
  }), "Download Report"))), /*#__PURE__*/React.createElement("div", {
    className: `pg ${page === 'att' ? 'on' : ''}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "ph"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "pt"
  }, "My Attendance"), /*#__PURE__*/React.createElement("div", {
    className: "ps"
  }, hrMonthLabel, " · Attendance calendar and monthly report"))), /*#__PURE__*/React.createElement("div", {
    className: "cal-sum"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cal-col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cal-n",
    style: {
      color: 'var(--grn)'
    }
  }, hrAttSummary.present), /*#__PURE__*/React.createElement("div", {
    className: "cal-l"
  }, "Present")), /*#__PURE__*/React.createElement("div", {
    className: "cal-col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cal-n",
    style: {
      color: 'var(--red)'
    }
  }, hrAttSummary.absent), /*#__PURE__*/React.createElement("div", {
    className: "cal-l"
  }, "Absent")), /*#__PURE__*/React.createElement("div", {
    className: "cal-col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cal-n",
    style: {
      color: 'var(--teal)'
    }
  }, hrAttSummary.holiday), /*#__PURE__*/React.createElement("div", {
    className: "cal-l"
  }, "Holiday")), /*#__PURE__*/React.createElement("div", {
    className: "cal-col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cal-n",
    style: {
      color: 'var(--amb)'
    }
  }, hrAttSummary.halfDay), /*#__PURE__*/React.createElement("div", {
    className: "cal-l"
  }, "Half Day")), /*#__PURE__*/React.createElement("div", {
    className: "cal-col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cal-n",
    style: {
      color: 'var(--pur)'
    }
  }, hrAttSummary.paidLeave), /*#__PURE__*/React.createElement("div", {
    className: "cal-l"
  }, "Paid Leave")), /*#__PURE__*/React.createElement("div", {
    className: "cal-col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cal-n",
    style: {
      color: 'var(--blu)'
    }
  }, hrAttSummary.weekOff), /*#__PURE__*/React.createElement("div", {
    className: "cal-l"
  }, "Week Off"))), /*#__PURE__*/React.createElement("div", {
    className: "cd"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
      flexWrap: 'wrap',
      padding: '12px 14px',
      borderBottom: '1px solid var(--br)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: 'var(--t1)'
    }
  }, "Attendance Calendar"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--t2)'
    }
  }, "Present, absent, holiday, leave and week off overview")), /*#__PURE__*/React.createElement("button", {
    className: "btn bs btn-sm",
    onClick: downloadHrAttendanceReport
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "download",
    size: 13
  }), "Download Report")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '12px 17px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "dnb dnl",
    style: {
      background: t.acc,
      width: 28,
      height: 28,
      fontSize: 16
    },
    onClick: () => changeHrAttendanceMonth(-1)
  }, "‹"), /*#__PURE__*/React.createElement("div", {
    className: "dl",
    style: {
      flex: 1,
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "calendar",
    size: 13,
    color: "var(--t2)"
  }), " ", hrMonthLabel), /*#__PURE__*/React.createElement("button", {
    className: "dnb dnr",
    style: {
      width: 28,
      height: 28,
      fontSize: 16
    },
    onClick: () => changeHrAttendanceMonth(1)
  }, "›")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 17px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "cg",
    style: {
      marginBottom: 8
    }
  }, ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => /*#__PURE__*/React.createElement("div", {
    key: d,
    className: "ch"
  }, d))), /*#__PURE__*/React.createElement("div", {
    className: "cg"
  }, Array.from({
    length: new Date(hrAttendanceYear, hrAttendanceMonth - 1, 1).getDay()
  }, (_, i) => /*#__PURE__*/React.createElement("div", {
    key: `e${i}`,
    className: "day de"
  })), Array.from({
    length: new Date(hrAttendanceYear, hrAttendanceMonth, 0).getDate()
  }, (_, i) => {
    const dayNum = i + 1,
      d = String(dayNum).padStart(2, '0');
    const dayData = hrAttData[d] || {};
    const st = mapHrAttendanceStatus(dayData.status || (new Date(hrAttendanceYear, hrAttendanceMonth - 1, dayNum) > new Date() ? 'future' : 'absent_pending'));
    const cls = {
      p: 'dp',
      a: 'da',
      h: 'dh',
      w: 'dw',
      hol: 'dhol',
      pl: 'dpl',
      ul: 'da',
      f: 'df'
    }[st] || 'dw';
    const monthText = new Date(hrAttendanceYear, hrAttendanceMonth - 1, dayNum).toLocaleDateString('en-GB', {
      month: 'short'
    });
    const lblMap = {
      p: 'PRESENT',
      a: 'ABSENT',
      h: 'HALF DAY',
      hol: 'HOLIDAY',
      w: 'WEEK OFF',
      pl: 'PAID LEAVE',
      ul: 'UNPAID LEAVE',
      f: ''
    };
    const lbl = lblMap[st] || '';
    return /*#__PURE__*/React.createElement("div", {
      key: d,
      className: `day ${cls}`
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'center',
        gap: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "day-num"
    }, d), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 9,
        fontWeight: 700,
        color: 'var(--t2)',
        textTransform: 'uppercase'
      }
    }, monthText)), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        marginTop: 2,
        fontSize: 8,
        fontWeight: 600,
        color: 'var(--t2)'
      }
    }, String(hrAttendanceYear)), lbl && /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        marginTop: 10,
        fontSize: 8.5,
        fontWeight: 700,
        color: st === 'p' ? 'var(--grn)' : st === 'a' || st === 'ul' ? 'var(--red)' : st === 'hol' ? 'var(--teal)' : st === 'pl' ? 'var(--pur)' : st === 'w' ? 'var(--blu)' : 'var(--amb)',
        textTransform: 'uppercase',
        letterSpacing: '.3px'
      }
    }, lbl), dayData.isLate && st === 'p' && /*#__PURE__*/React.createElement("span", {
      className: "dt-late"
    }, "LATE"));
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 17px 13px',
      borderTop: '1px solid var(--br)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 600,
      color: 'var(--t2)'
    }
  }, "Selected month: ", hrMonthLabel), /*#__PURE__*/React.createElement("button", {
    className: "btn bs btn-sm",
    onClick: downloadHrAttendanceReport
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "download",
    size: 13
  }), "Download Report"))), /*#__PURE__*/React.createElement("div", {
    className: `pg ${page === 'pend' ? 'on' : ''}`
  }, hrViewReceipt && /*#__PURE__*/React.createElement(ReceiptModal, {
    url: hrViewReceipt.url,
    title: hrViewReceipt.title,
    onClose: () => setHrViewReceipt(null)
  }), /*#__PURE__*/React.createElement("div", {
    className: "ph"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "pt"
  }, "Leave Requests"))), /*#__PURE__*/React.createElement("div", {
    className: "tabs",
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: `tab ${pendTab === 'leave' ? 'on' : ''}`,
    onClick: () => setPendTab('leave')
  }, "Leave Requests"), /*#__PURE__*/React.createElement("div", {
    className: `tab ${pendTab === 'reimb' ? 'on' : ''}`,
    onClick: () => setPendTab('reimb')
  }, "Reimbursement")), pendTab === 'leave' && globalLeaves.map(r => /*#__PURE__*/React.createElement("div", {
    key: r.id,
    className: "lrc"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lrc-top"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "av-row",
    style: {
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement(Av, {
    name: r.name,
    size: 28,
    r: 7
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "lrc-nm"
  }, r.name), /*#__PURE__*/React.createElement("div", {
    className: "lrc-ty"
  }, r.type, " \xB7 ", r.days, " day", r.days !== 1 ? 's' : '', " \xB7 ", r.from, "\u2013", r.to)))), /*#__PURE__*/React.createElement("span", {
    className: `bg ${r.status === 'pending' ? 'bg-pend' : r.status === 'approved' ? 'bg-appr' : 'bg-rej'}`,
    style: {
      fontSize: 9
    }
  }, r.status.charAt(0).toUpperCase() + r.status.slice(1))), /*#__PURE__*/React.createElement("div", {
    className: "lrc-rs"
  }, r.reason), r.rejReason && /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--rd)',
      borderRadius: 7,
      padding: '6px 10px',
      fontSize: 11,
      color: 'var(--red)',
      marginBottom: 7,
      display: 'flex',
      alignItems: 'center',
      gap: 5
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "alert",
    size: 12,
    color: "var(--red)"
  }), "Reason: ", r.rejReason), r.status === 'pending' && (hrRejectingId === r.id ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 600,
      color: 'var(--t2)',
      marginBottom: 5
    }
  }, "Rejection reason (sent as notification to employee):"), /*#__PURE__*/React.createElement("textarea", {
    className: "f-in",
    rows: 2,
    style: {
      resize: 'vertical',
      marginBottom: 6
    },
    placeholder: "Enter reason...",
    value: hrRejectReason,
    onChange: e => setHrRejectReason(e.target.value)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 7
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn bd2 btn-sm",
    onClick: async () => {
      if (!hrRejectReason.trim()) {
        alert('Enter a reason');
        return;
      }
      try {
        await fetch(`/leaves/${r.id}/reject`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ reason: hrRejectReason })
        });
        setGlobalLeaves(l => l.map(x => x.id === r.id ? {
          ...x,
          status: 'rejected',
          rejReason: hrRejectReason
        } : x));
        addActivity('HR Manager', 'HR', `rejected leave for ${r.name}`, r.type, 'leave', 'var(--red)');
        addEmpNotif(r.name, {
          type: 'leave_rej',
          title: 'Leave Rejected',
          body: `Your ${r.type} (${r.from}–${r.to}) was rejected. Reason: ${hrRejectReason}`,
          time: 'Just now',
          color: 'var(--red)'
        });
        setHrRejectingId(null);
        setHrRejectReason('');
      } catch (e) { alert('Rejection failed'); }
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "x",
    size: 12
  }), "Confirm Reject"), /*#__PURE__*/React.createElement("button", {
    className: "btn bs btn-sm",
    onClick: () => {
      setHrRejectingId(null);
      setHrRejectReason('');
    }
  }, "Cancel"))) : /*#__PURE__*/React.createElement("div", {
    className: "lrc-acts"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-sm",
    style: {
      background: 'var(--grn)',
      color: '#fff'
    },
    onClick: async () => {
        try {
          await fetch(`/leaves/${r.id}/approve`, {
            method: 'PUT',
            credentials: 'include'
          });
          setGlobalLeaves(l => l.map(x => x.id === r.id ? { ...x, status: 'approved' } : x));
          addActivity('HR Manager', 'HR', `approved leave for ${r.name}`, r.type, 'leave', 'var(--grn)');
        } catch (e) { alert('Approval failed'); }
      }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "check",
    size: 12,
    color: "#fff"
  }), "Approve"), /*#__PURE__*/React.createElement("button", {
    className: "btn bd2 btn-sm",
    onClick: () => {
      setHrRejectingId(r.id);
      setHrRejectReason('');
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "x",
    size: 12
  }), "Reject"))))), pendTab === 'reimb' && globalReimb.map(r => /*#__PURE__*/React.createElement("div", {
    key: r.id,
    className: "reimb-card"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "av-row",
    style: {
      marginBottom: 5
    }
  }, /*#__PURE__*/React.createElement(Av, {
    name: r.name,
    size: 28,
    r: 7
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "lrc-nm"
  }, r.name), /*#__PURE__*/React.createElement("div", {
    className: "lrc-ty"
  }, r.category, " \xB7 ", r.date))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: 'var(--t1)',
      marginLeft: 37
    }
  }, r.title)), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 800,
      color: 'var(--grn)'
    }
  }, "\u20B9", r.amount.toLocaleString()), /*#__PURE__*/React.createElement("span", {
    className: `bg ${r.status === 'pending' ? 'bg-pend' : r.status === 'approved' ? 'bg-appr' : 'bg-rej'}`,
    style: {
      fontSize: 9,
      display: 'block',
      marginTop: 4
    }
  }, r.status.charAt(0).toUpperCase() + r.status.slice(1)))), r.rejReason && /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--rd)',
      borderRadius: 7,
      padding: '6px 10px',
      fontSize: 11,
      color: 'var(--red)',
      marginBottom: 7,
      display: 'flex',
      alignItems: 'center',
      gap: 5
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "alert",
    size: 12,
    color: "var(--red)"
  }), "Reason: ", r.rejReason), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginBottom: 8,
      padding: '7px 10px',
      background: 'var(--s2)',
      borderRadius: 7,
      border: '1px solid var(--br)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "doc",
    size: 13,
    color: "var(--t2)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: 'var(--t2)',
      flex: 1
    }
  }, "Receipt attached"), /*#__PURE__*/React.createElement("button", {
    style: {
      background: 'none',
      border: 'none',
      color: 'var(--blu)',
      fontSize: 11,
      cursor: 'pointer',
      fontWeight: 600,
      fontFamily: 'Inter',
      display: 'flex',
      alignItems: 'center',
      gap: 3
    },
    onClick: () => setHrViewReceipt({
      url: r.receipt,
      title: r.title
    })
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "eye",
    size: 12,
    color: "var(--blu)"
  }), "View Receipt")), r.status === 'pending' && (hrRejectingId === `reimb_${r.id}` ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("textarea", {
    className: "f-in",
    rows: 2,
    style: {
      resize: 'vertical',
      marginBottom: 6
    },
    placeholder: "Rejection reason...",
    value: hrRejectReason,
    onChange: e => setHrRejectReason(e.target.value)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 7
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn bd2 btn-sm",
    onClick: async () => {
      if (!hrRejectReason.trim()) {
        alert('Enter a reason');
        return;
      }
      try {
        await fetch(`/reimbursements/${r.id}/reject`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ reason: hrRejectReason })
        });
        setGlobalReimb(rr => rr.map(x => x.id === r.id ? {
          ...x,
          status: 'rejected',
          rejReason: hrRejectReason
        } : x));
        addEmpNotif(r.name, {
          type: 'reimb_rej',
          title: 'Reimbursement Rejected',
          body: `"${r.title}" (₹${r.amount}) rejected. Reason: ${hrRejectReason}`,
          time: 'Just now',
          color: 'var(--red)'
        });
        addActivity('HR Manager', 'HR', `rejected reimb for ${r.name}`, r.title, 'reimb', 'var(--red)');
        setHrRejectingId(null);
        setHrRejectReason('');
      } catch (e) { alert('Rejection failed'); }
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "x",
    size: 12
  }), "Confirm Reject"), /*#__PURE__*/React.createElement("button", {
    className: "btn bs btn-sm",
    onClick: () => {
      setHrRejectingId(null);
      setHrRejectReason('');
    }
  }, "Cancel"))) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 7
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-sm",
    style: {
      background: 'var(--grn)',
      color: '#fff'
    },
    onClick: async () => {
      try {
        await fetch(`/reimbursements/${r.id}/approve`, {
          method: 'PUT',
          credentials: 'include'
        });
        setGlobalReimb(rr => rr.map(x => x.id === r.id ? { ...x, status: 'approved' } : x));
        addActivity('HR Manager', 'HR', `approved reimb for ${r.name}`, `${r.title} · ₹${r.amount}`, 'reimb', 'var(--pur)');
      } catch (e) { alert('Approval failed'); }
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "check",
    size: 12,
    color: "#fff"
  }), "Approve \u20B9", r.amount.toLocaleString()), /*#__PURE__*/React.createElement("button", {
    className: "btn bd2 btn-sm",
    onClick: () => {
      setHrRejectingId(`reimb_${r.id}`);
      setHrRejectReason('');
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "x",
    size: 12
  }), "Reject")))))), /*#__PURE__*/React.createElement("div", {
    className: `pg ${page === 'payroll' ? 'on' : ''}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "ph"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "pt"
  }, "Payroll"), /*#__PURE__*/React.createElement("div", {
    className: "ps"
  }, "Salary processing \xB7 attendance-based calculation")), /*#__PURE__*/React.createElement("div", {
    className: "pa"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dl",
    style: {
      padding: '6px 10px',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "calendar",
    size: 13,
    color: "var(--t2)"
  }), /*#__PURE__*/React.createElement("select", {
    style: {
      background: 'none',
      border: 'none',
      outline: 'none',
      fontFamily: 'Inter',
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--t1)',
      cursor: 'pointer'
    },
    value: hrPayrollMonth,
    onChange: e => setHrPayrollMonth(e.target.value)
  }, ['January 2026', 'February 2026', 'March 2026', 'April 2026'].map(m => /*#__PURE__*/React.createElement("option", {
    key: m
  }, m)))), /*#__PURE__*/React.createElement("button", {
    className: "btn bs btn-sm",
    onClick: () => {
      setPage('settings');
      setHrSettingsSub('salary');
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "settings",
    size: 13
  }), "Salary Settings"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-sm",
    style: {
      background: 'var(--grn)',
      color: '#fff'
    },
    onClick: () => setHrPaidIds(new Set(globalStaff.map(s => s.id)))
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "check",
    size: 13,
    color: "#fff"
  }), "Process All"))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'rgba(124,58,237,0.05)',
      border: '1px solid rgba(124,58,237,0.18)',
      borderRadius: 10,
      padding: '10px 16px',
      marginBottom: 14,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "info",
    size: 15,
    color: "var(--pur)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'var(--t1)'
    }
  }, /*#__PURE__*/React.createElement("b", null, "Cycle:"), " ", (salarySettings || DEFAULT_SALARY_SETTINGS).cycleStart, "\u2013", (salarySettings || DEFAULT_SALARY_SETTINGS).cycleEnd, " monthly \xA0\xB7\xA0", /*#__PURE__*/React.createElement("b", null, "Pay Day:"), " ", (salarySettings || DEFAULT_SALARY_SETTINGS).payDay, (salarySettings || DEFAULT_SALARY_SETTINGS).payMonth === 'next' ? ' next month' : ' same month', " \xA0\xB7\xA0", /*#__PURE__*/React.createElement("b", null, "Formula:"), " Basic \xF7 Month Days \xD7 (Present + WeekOff + Holidays)"), /*#__PURE__*/React.createElement("button", {
    className: "btn bs btn-sm",
    style: {
      marginLeft: 'auto',
      fontSize: 10
    },
    onClick: () => {
      setPage('settings');
      setHrSettingsSub('holiday');
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "settings",
    size: 11
  }), "Holiday Settings")), /*#__PURE__*/React.createElement("div", {
    className: "cd"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cd-h"
  }, /*#__PURE__*/React.createElement("span", {
    className: "cd-t"
  }, "Staff Payroll \u2014 ", hrPayrollMonth), /*#__PURE__*/React.createElement("button", {
    className: "btn bs btn-sm"
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "download",
    size: 13
  }), "Export")), /*#__PURE__*/React.createElement("div", {
    style: {
      overflowX: 'auto'
    }
  }, payLoading ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 40,
      textAlign: 'center'
    }
  }, "Loading payroll data...") : /*#__PURE__*/React.createElement("table", null, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Employee"), /*#__PURE__*/React.createElement("th", null, "Basic"), /*#__PURE__*/React.createElement("th", null, "Present/Days"), /*#__PURE__*/React.createElement("th", null, "WeekOff + Holiday"), /*#__PURE__*/React.createElement("th", null, "Net Payable"), /*#__PURE__*/React.createElement("th", null, "Status"), /*#__PURE__*/React.createElement("th", null, "Action"))), /*#__PURE__*/React.createElement("tbody", null, (payrollList.length > 0 ? payrollList.map(p => ({
    ...p.employee,
    payroll: p
  })) : globalStaff).map(s => {
    const p = s.payroll;
    const sd = p ? {
      basic: p.basic_earned,
      presentDays: p.present_days
    } : (salaryData || {})[s.id] || {
      basic: 0,
      presentDays: 0
    };
    const sal = p ? {
      payable: p.net_payable,
      totalDays: p.present_days + p.week_off_days + p.paid_holiday_days + p.lop_days,
      weekoffs: p.week_off_days,
      paidHols: p.paid_holiday_days
    } : calcSalary(sd, 0, salarySettings || DEFAULT_SALARY_SETTINGS);
    const isPaid = p?.status === 'paid' || hrPaidIds.has(s.id);
    const isEdit = hrEditSalId === s.id;
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: s.id
    }, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
      className: "av-row"
    }, /*#__PURE__*/React.createElement(Av, {
      name: s.name,
      size: 26,
      r: 7
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: 11
      }
    }, s.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 9,
        color: 'var(--t2)'
      }
    }, s.role)))), /*#__PURE__*/React.createElement("td", {
      style: {
        fontFamily: 'monospace',
        fontSize: 11
      }
    }, "\u20B9", (sd.basic || 0).toLocaleString()), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        fontWeight: 700
      }
    }, sd.presentDays || 0), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        color: 'var(--t3)'
      }
    }, "/", sal.totalDays, "d")), /*#__PURE__*/React.createElement("td", {
      style: {
        fontSize: 11
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--grn)'
      }
    }, "+", sal.weekoffs, "wo"), sal.paidHols > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--blu)',
        marginLeft: 4
      }
    }, "+", sal.paidHols, "h")), /*#__PURE__*/React.createElement("td", {
      style: {
        fontFamily: 'monospace',
        fontSize: 14,
        fontWeight: 800,
        color: 'var(--t1)'
      }
    }, "\u20B9", sal.payable.toLocaleString()), /*#__PURE__*/React.createElement("td", null, isPaid ? /*#__PURE__*/React.createElement("span", {
      className: "bg bg-appr",
      style: {
        fontSize: 9
      }
    }, "Paid") : /*#__PURE__*/React.createElement("span", {
      className: "bg bg-pend",
      style: {
        fontSize: 9
      }
    }, "Pending")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 5
      }
    }, /*#__PURE__*/React.createElement("button", {
      className: "btn bs btn-sm",
      style: {
        fontSize: 10,
        padding: '3px 7px'
      },
      onClick: () => setHrEditSalId(isEdit ? null : s.id)
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "edit",
      size: 11
    }), isEdit ? 'Close' : 'Edit'), !isPaid && /*#__PURE__*/React.createElement("button", {
      className: "btn btn-sm",
      style: {
        background: t.acc,
        color: '#fff',
        fontSize: 10,
        padding: '3px 8px'
      },
      onClick: () => handlePaySalary(s.id, sal.payable)
    }, "Pay"), /*#__PURE__*/React.createElement("button", {
      className: "btn bs btn-sm",
      style: {
        fontSize: 10,
        padding: '3px 7px'
      },
      onClick: () => setHrShowPayslip({
        empData: s,
        salData: sd,
        month: 3,
        year: 2026
      })
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "doc",
      size: 11
    }), "Slip")))), isEdit && /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
      colSpan: 7,
      style: {
        padding: '0 13px 13px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'var(--s2)',
        borderRadius: 10,
        padding: '14px',
        border: '1px solid var(--br)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        fontWeight: 700,
        color: 'var(--t2)',
        marginBottom: 10
      }
    }, "Edit \u2014 ", s.name), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4,1fr)',
        gap: 8
      }
    }, [['basic', 'Basic'], ['bonus', 'Bonus'], ['overtime', 'Overtime'], ['incentive', 'Incentive'], ['presentDays', 'Present Days']].map(([k, label]) => /*#__PURE__*/React.createElement("div", {
      key: k
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 9,
        color: 'var(--t3)',
        fontWeight: 700,
        textTransform: 'uppercase',
        marginBottom: 3
      }
    }, label), /*#__PURE__*/React.createElement("input", {
      className: "f-in",
      style: {
        padding: '6px 9px',
        fontSize: 12
      },
      type: "number",
      value: sd[k] || 0,
      onChange: e => setSalaryData(d => ({
        ...d,
        [s.id]: {
          ...(d[s.id] || {}),
          month: 3,
          year: 2026,
          [k]: Number(e.target.value)
        }
      }))
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'flex-end'
      }
    }, /*#__PURE__*/React.createElement("button", {
      className: "btn btn-full",
      style: {
        background: t.acc,
        color: '#fff'
      },
      onClick: () => setHrEditSalId(null)
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "check",
      size: 13,
      color: "#fff"
    }), "Done"))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'rgba(124,58,237,0.07)',
        borderRadius: 8,
        padding: '9px 12px',
        fontSize: 12,
        color: 'var(--t1)',
        marginTop: 10
      }
    }, "Preview: \u20B9", (sd.basic || 0).toLocaleString(), " \xF7 ", sal.totalDays, "d \xD7 (", sd.presentDays || 0, " + ", sal.weekoffs, "wo + ", sal.paidHols, "h) = ", /*#__PURE__*/React.createElement("b", {
      style: {
        color: t.acc
      }
    }, "\u20B9", sal.earnedBasic?.toLocaleString() || 0), " + Reimb \u20B9", reimbAmt.toLocaleString(), " = ", /*#__PURE__*/React.createElement("b", {
      style: {
        color: 'var(--grn)'
      }
    }, "\u20B9", sal.payable.toLocaleString()))))));
  })))))), /*#__PURE__*/React.createElement("div", {
    className: `pg ${page === 'reports' ? 'on' : ''}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "ph"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "pt"
  }, "Reports"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: 10
    }
  }, [['chart', 'Attendance Report'], ['dollar', 'Salary Report'], ['clipboard', 'Leave Report'], ['users', 'Employee Report'], ['clock', 'Late Coming'], ['doc', 'Custom Report']].map(([ic, l]) => /*#__PURE__*/React.createElement("div", {
    key: l,
    className: "cd",
    style: {
      padding: 14,
      cursor: 'pointer'
    },
    onClick: () => alert(l + ' will be available for download soon.')
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 38,
      height: 38,
      borderRadius: 10,
      background: t.accDim,
      border: `1px solid ${t.accBorder}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 9
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: ic,
    size: 18,
    color: t.acc
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: 'var(--t1)'
    }
  }, l))))), /*#__PURE__*/React.createElement("div", {
    className: `pg ${page === 'settings' ? 'on' : ''}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "ph"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "pt"
  }, "Settings"), /*#__PURE__*/React.createElement("div", {
    className: "ps"
  }, "Manage holidays, week off and attendance rules"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '180px 1fr',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "cd",
    style: {
      height: 'fit-content'
    }
  }, [{
    id: 'holiday',
    ic: 'gift',
    l: 'Holidays & Week Off'
  }, {
    id: 'att',
    ic: 'calendar',
    l: 'Attendance Rules'
  }, {
    id: 'leave',
    ic: 'leave',
    l: 'Leave Policy'
  }].map(s => /*#__PURE__*/React.createElement("div", {
    key: s.id,
    className: "sr",
    style: hrSettingsSub === s.id ? {
      background: t.accDim,
      borderLeft: `2px solid ${t.acc}`
    } : {
      borderLeft: '2px solid transparent'
    },
    onClick: () => setHrSettingsSub(s.id)
  }, /*#__PURE__*/React.createElement("div", {
    className: "sic"
  }, /*#__PURE__*/React.createElement(Icon, {
    n: s.ic,
    size: 15,
    color: hrSettingsSub === s.id ? t.acc : 'var(--t2)'
  })), /*#__PURE__*/React.createElement("span", {
    className: "slb",
    style: {
      color: hrSettingsSub === s.id ? t.acc : 'var(--t1)'
    }
  }, s.l), /*#__PURE__*/React.createElement(Icon, {
    n: "chevron_right",
    size: 13,
    color: hrSettingsSub === s.id ? t.acc : 'var(--t3)'
  })))), /*#__PURE__*/React.createElement("div", {
    className: "cd"
  }, hrSettingsSub === "holiday" && /*#__PURE__*/React.createElement(HolidaySettingsPanel, {
    salarySettings: salarySettings,
    setSalarySettings: setSalarySettings,
    accentColor: t.acc,
    yearlyHolidays: yearlyHolidays,
    setYearlyHolidays: setYearlyHolidays
  }), hrSettingsSub !== 'holiday' && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '50px 20px',
      textAlign: 'center',
      color: 'var(--t3)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "settings",
    size: 28,
    color: "var(--t3)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--t2)'
    }
  }, "Configuration coming soon"))))))));
};

// ─── EMPLOYEE PANEL ───────────────────────────────────────────────────────
const EmpPanel = ({
  user,
  onLogout,
  geoSettings,
  globalStaff,
  globalLeaves,
  setGlobalLeaves,
  globalActivity,
  setGlobalActivity,
  globalReimb,
  setGlobalReimb,
  empNotifs,
  addEmpNotif,
  salaryData,
  salarySettings,
  yearlyHolidays,
  setYearlyHolidays
}) => {
  const t = THEME.employee;
  const emp = globalStaff.find(s => s.id === user.empId) || globalStaff[0] || { 
    id: user.empId, 
    name: user.name, 
    email: user.email,
    dept: '—', 
    branch: 'b1', 
    ls: 'out',
    role: 'Employee',
    phone: '—',
    gender: 'Select',
    marital: 'Select',
    blood: 'Select',
    emName: '—',
    emPhone: '—',
    loc: 'Not Set'
  };
  const [page, setPage] = useState('salary');
  const [sideOpen, setSideOpen] = useState(false);
  const [leaveModal, setLeaveModal] = useState(false);
  const [reimbModal, setReimbModal] = useState(false);
  const [showAttModal, setShowAttModal] = useState(false);
  const [subPage, setSubPage] = useState(null);
  const clsMap = {
    p: 'dp',
    a: 'da',
    h: 'dh',
    w: 'dw'
  };
  const [reimbForm, setReimbForm] = useState({
    title: '',
    amount: '',
    category: 'Travel',
    note: ''
  });
  const [empSalMonth, setEmpSalMonth] = useState(new Date().getMonth() + 1);
  const [empSalYear, setEmpSalYear] = useState(new Date().getFullYear());
  const [empPunchStatus, setEmpPunchStatus] = useState(emp?.ls || 'out');
  const [empAttMonth, setEmpAttMonth] = useState(new Date().getMonth() + 1);
  const [empAttYear, setEmpAttYear] = useState(new Date().getFullYear());
  const [empAttData, setEmpAttData] = useState({});
  const [empAttSummary, setEmpAttSummary] = useState({
    present: 0,
    halfDay: 0,
    absent: 0,
    weekOff: 0,
    holiday: 0,
    leave: 0,
    paidLeave: 0,
    unpaidLeave: 0
  });
  const [empAttLoading, setEmpAttLoading] = useState(false);
  const [empSalaryStructure, setEmpSalaryStructure] = useState(null);
  const [empSalaryLoading, setEmpSalaryLoading] = useState(false);
  const navItems = [{
    id: 'home',
    ic: 'home',
    l: 'My Dashboard'
  }, {
    id: 'att',
    ic: 'calendar',
    l: 'My Attendance'
  }, {
    id: 'salary',
    ic: 'dollar',
    l: 'My Salary'
  }, {
    id: 'leaves',
    ic: 'leave',
    l: 'Leave Requests'
  }, {
    id: 'reimburse',
    ic: 'receipt',
    l: 'Reimbursement'
  }, {
    id: 'notif',
    ic: 'bell',
    l: 'Notifications'
  }, {
    id: 'profile',
    ic: 'user',
    l: 'My Profile'
  }, {
    id: 'docs',
    ic: 'doc',
    l: 'Documents'
  }];
  const go = p => {
    setPage(p);
    setSideOpen(false);
    setSubPage(null);
  };
  const addActivity = (who, role, action, detail, type, color) => {
    setGlobalActivity(a => [{
      id: Date.now(),
      who,
      role,
      action,
      detail,
      when: 'Just now',
      type,
      color
    }, ...a.slice(0, 19)]);
  };
  const myLeaves = globalLeaves.filter(r => r.name === emp?.name);
  const myReimb = globalReimb.filter(r => r.name === emp?.name);
  const myNotifs = empNotifs[emp?.name] || [];
  const [viewReceiptData, setViewReceiptData] = useState(null);
  const [empShowPayslip, setEmpShowPayslip] = useState(null);
  const sd = {
    ...(empSalaryStructure || salaryData?.[emp?.id] || {
      basic: 0,
      presentDays: 0,
      month: empSalMonth,
      year: empSalYear,
      hra: 0,
      da: 0,
      bonus: 0,
      overtime: 0,
      incentive: 0
    }),
    presentDays: empAttSummary.present || Number((empSalaryStructure || salaryData?.[emp?.id] || {}).presentDays) || 0,
    month: empSalMonth,
    year: empSalYear
  };
  const empReimbApproved = myReimb.filter(r => r.status === 'approved').reduce((a, r) => a + r.amount, 0);
  const empSal = calcSalary(sd, empReimbApproved, salarySettings || DEFAULT_SALARY_SETTINGS);
  const displayEmpSal = empSal;
  const displaySd = {
    ...sd,
    incentive: 0
  };
  const MONTHS_SH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formatSelfTime = useCallback(value => value ? new Date(value).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  }) : '', []);
  const mapSelfAttendanceStatus = useCallback(status => {
    switch (status) {
      case 'present':
        return 'p';
      case 'half_day':
        return 'h';
      case 'week_off':
        return 'w';
      case 'holiday':
        return 'hol';
      case 'paid_leave':
        return 'pl';
      case 'unpaid_leave':
        return 'ul';
      case 'future':
        return 'f';
      case 'absent':
      case 'absent_pending':
      default:
        return 'a';
    }
  }, []);
  const empAttendanceMonthLabel = new Date(empAttYear, empAttMonth - 1, 1).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric'
  });
  const empSalaryMonthLabel = new Date(empSalYear, empSalMonth - 1, 1).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric'
  });
  const changeEmpAttendanceMonth = delta => {
    const nextDate = new Date(empAttYear, empAttMonth - 1 + delta, 1);
    setEmpAttYear(nextDate.getFullYear());
    setEmpAttMonth(nextDate.getMonth() + 1);
  };
  const changeEmpSalaryMonth = delta => {
    const nextDate = new Date(empSalYear, empSalMonth - 1 + delta, 1);
    setEmpSalYear(nextDate.getFullYear());
    setEmpSalMonth(nextDate.getMonth() + 1);
  };
  const fetchEmpAttendance = useCallback(async () => {
    setEmpAttLoading(true);
    try {
      const statusRes = await fetch(`/attendance/today`, {
        credentials: 'include'
      });
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setEmpPunchStatus(statusData.hasPunchedIn && !statusData.hasPunchedOut ? 'in' : 'out');
      }
      const historyRes = await fetch(`/attendance/my?month=${empAttMonth}&year=${empAttYear}`, {
        credentials: 'include'
      });
      if (historyRes.ok) {
        const {
          days = [],
          summary = {}
        } = await historyRes.json();
        const processedAttData = {};
        days.forEach(day => {
          processedAttData[String(day.day).padStart(2, '0')] = day;
        });
        setEmpAttData(processedAttData);
        setEmpAttSummary({
          present: summary.present || 0,
          halfDay: summary.halfDay || 0,
          absent: summary.absent || 0,
          weekOff: summary.weekOff || 0,
          holiday: summary.holiday || 0,
          leave: summary.leave || 0,
          paidLeave: summary.paidLeave || 0,
          unpaidLeave: summary.unpaidLeave || 0
        });
      }
    } catch (error) {
      console.error('Error fetching employee attendance:', error);
    } finally {
      setEmpAttLoading(false);
    }
  }, [empAttMonth, empAttYear]);
  useEffect(() => {
    fetchEmpAttendance();
  }, [fetchEmpAttendance]);
  useEffect(() => {
    if (page !== 'salary' || !emp?.id) return;
    setEmpSalaryLoading(true);
    fetch(`/employees/${emp.id}/salary`, {
      credentials: 'include'
    }).then(async response => {
      if (!response.ok) return null;
      return response.json();
    }).then(data => {
      if (!data) {
        setEmpSalaryStructure(null);
        return;
      }
      setEmpSalaryStructure({
        basic: Number(data.basic) || 0,
        hra: Number(data.hra) || 0,
        da: Number(data.da) || 0,
        bonus: Number(data.bonus) || 0,
        overtime: Number(data.overtime) || 0,
        incentive: Number(data.incentive) || 0,
        presentDays: Number(data.presentDays) || 0,
        month: empSalMonth,
        year: empSalYear
      });
    }).catch(error => {
      console.error('Error fetching employee salary:', error);
      setEmpSalaryStructure(null);
    }).finally(() => setEmpSalaryLoading(false));
  }, [emp?.id, empSalMonth, empSalYear, page]);
  const downloadEmpAttendanceReport = () => {
    const rows = Object.values(empAttData).sort((a, b) => Number(a.day || 0) - Number(b.day || 0)).map(day => [day.date, day.status, formatSelfTime(day.punchIn), formatSelfTime(day.punchOut), day.workingHours || '']);
    const csv = [['Date', 'Status', 'Punch In', 'Punch Out', 'Working Hours'], ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(emp?.name || 'employee').replace(/\s+/g, '-').toLowerCase()}-${empAttMonth}-${empAttYear}-attendance.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };
  const getEmpProfileStatus = dayNum => {
    const d = String(dayNum).padStart(2, '0');
    const now = new Date();
    const holidaySource = (yearlyHolidays && yearlyHolidays[now.getFullYear()] && yearlyHolidays[now.getFullYear()][now.getMonth() + 1]) || (salarySettings?.paidHolidays || DEFAULT_SALARY_SETTINGS.paidHolidays || []);
    const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${d}`;
    const isHoliday = Array.isArray(holidaySource)
      ? holidaySource.includes(dateKey) || holidaySource.includes(dayNum)
      : !!holidaySource[dateKey] || !!holidaySource[dayNum];
    if (isHoliday) return 'h';
    if (CAL_DATA[d]) return CAL_DATA[d];
    return (dayNum > now.getDate() ? 'f' : 'w');
  };
  const profileCounts = {
    p: 0,
    a: 0,
    h: 0,
    pl: 0,
    w: 0,
    hdl: 0,
    ul: 0
  };
  for (let i = 1; i <= 20; i++) {
    const s = getEmpProfileStatus(i);
    if (s === 'p') profileCounts.p++; else if (s === 'a') profileCounts.a++; else if (s === 'h' || s === 'hol') profileCounts.h++; else if (s === 'pl') profileCounts.pl++; else if (s === 'w') profileCounts.w++; else if (s === 'hdl') profileCounts.hdl++; else if (s === 'ul') profileCounts.ul++;
  }
  const profileStatCls = {
    p: 'dp',
    a: 'da',
    h: 'dh',
    w: 'dw',
    hol: 'dh',
    pl: 'dp',
    hdl: 'dh',
    ul: 'da',
    f: 'df'
  };
  const handleApplyLeave = async (type, from, to, days, reason) => {
    try {
      const res = await fetch(`${API_BASE}/leaves`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          type: type,
          from_date: from,
          to_date: to,
          reason: reason
        })
      });
      if (res.ok) {
        const newLeave = await res.json();
        setGlobalLeaves(l => [...l, {
          id: newLeave.id,
          name: emp.name,
          type: newLeave.type || type,
          from: new Date(newLeave.from_date).toLocaleDateString(),
          to: new Date(newLeave.to_date).toLocaleDateString(),
          days,
          reason: newLeave.reason || reason,
          status: 'pending'
        }]);
        addActivity(emp.name, 'Employee', `applied ${type}`, `${from} – ${to}, ${days} day${days !== 1 ? 's' : ''}`, 'leave', 'var(--amb)');
        setLeaveModal(false);
      } else {
        const err = await res.json();
        alert('Failed to submit leave request: ' + (err.message || ''));
      }
    } catch (e) {
      console.error(e);
      alert('Failed to submit leave request');
    }
  };
  const handleSubmitReimb = async () => {
    if (!reimbForm.title || !reimbForm.amount) return;
    try {
      const res = await fetch(`${API_BASE}/reimbursements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          category: reimbForm.category,
          amount: Number(reimbForm.amount),
          description: reimbForm.title + (reimbForm.note ? ` - ${reimbForm.note}` : '')
        })
      });
      if (res.ok) {
        const newReimb = await res.json();
        const item = {
          id: newReimb.id,
          name: emp.name,
          title: newReimb.description || reimbForm.title,
          amount: Number(newReimb.amount),
          date: new Date(newReimb.created_at).toLocaleDateString(),
          category: newReimb.category || reimbForm.category,
          receipt: 'uploaded',
          status: 'pending'
        };
        setGlobalReimb(r => [...r, item]);
        addActivity(emp.name, 'Employee', `submitted Reimbursement`, `${reimbForm.title} · ₹${reimbForm.amount}`, 'reimb', 'var(--blu)');
        setReimbModal(false);
        setReimbForm({
          title: '',
          amount: '',
          category: 'Travel',
          note: ''
        });
      } else {
        alert('Failed to submit reimbursement');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to submit reimbursement');
    }
  };
  if (subPage === 'personal') return /*#__PURE__*/React.createElement("div", {
    className: "layout"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tb",
    style: {
      left: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "tb-t"
  }, "Personal Details"), /*#__PURE__*/React.createElement("div", {
    className: "tb-r"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-sm",
    style: {
      background: t.acc,
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "doc",
    size: 13,
    color: "#fff"
  }), "Biodata"))), /*#__PURE__*/React.createElement("div", {
    className: "main",
    style: {
      marginLeft: 0,
      padding: '76px 22px 22px'
    }
  }, /*#__PURE__*/React.createElement(PersonalForm, {
    emp: emp,
    onBack: () => setSubPage(null),
    accentColor: t.acc
  })));
  return /*#__PURE__*/React.createElement("div", {
    className: "layout"
  }, showAttModal && /*#__PURE__*/React.createElement(AttendanceModal, {
    user: user,
    onClose: () => setShowAttModal(false),
    userName: emp?.name || '',
    geoSettings: geoSettings,
    currentStatus: empPunchStatus,
    onSuccess: async (type, time, addr) => {
      setEmpPunchStatus(type);
      addActivity(emp.name, 'Employee', `marked ${type === 'in' ? 'Punch In' : 'Punch Out'}`, `${time} · ${addr}`, 'punch', type === 'in' ? 'var(--grn)' : 'var(--red)');
      await fetchEmpAttendance();
    }
  }), empShowPayslip && /*#__PURE__*/React.createElement(PayslipModal, {
    onClose: () => setEmpShowPayslip(null),
    empData: empShowPayslip.empData,
    salData: empShowPayslip.salData,
    salSettings: salarySettings,
    month: empShowPayslip.month,
    year: empShowPayslip.year,
    globalReimb: globalReimb
  }), leaveModal && /*#__PURE__*/React.createElement("div", {
    className: "modal-ov",
    onClick: e => e.target === e.currentTarget && setLeaveModal(false)
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-box"
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "modal-title"
  }, "Apply for Leave"), /*#__PURE__*/React.createElement("button", {
    style: {
      width: 28,
      height: 28,
      borderRadius: 7,
      background: 'var(--s2)',
      border: '1px solid var(--br)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    onClick: () => setLeaveModal(false)
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "x",
    size: 14,
    color: "var(--t2)"
  }))), /*#__PURE__*/React.createElement(LeaveForm, {
    onSubmit: handleApplyLeave,
    onCancel: () => setLeaveModal(false),
    accentColor: t.acc
  }))), reimbModal && /*#__PURE__*/React.createElement("div", {
    className: "modal-ov",
    onClick: e => e.target === e.currentTarget && setReimbModal(false)
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-box"
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "modal-title"
  }, "Submit Reimbursement"), /*#__PURE__*/React.createElement("button", {
    style: {
      width: 28,
      height: 28,
      borderRadius: 7,
      background: 'var(--s2)',
      border: '1px solid var(--br)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    onClick: () => setReimbModal(false)
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "x",
    size: 14,
    color: "var(--t2)"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "modal-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fg"
  }, /*#__PURE__*/React.createElement("label", {
    className: "fl"
  }, "Expense Title"), /*#__PURE__*/React.createElement("input", {
    className: "f-in",
    value: reimbForm.title,
    onChange: e => setReimbForm(f => ({
      ...f,
      title: e.target.value
    })),
    placeholder: "eg. Client Lunch Meeting"
  })), /*#__PURE__*/React.createElement("div", {
    className: "fr"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fg"
  }, /*#__PURE__*/React.createElement("label", {
    className: "fl"
  }, "Amount (\u20B9)"), /*#__PURE__*/React.createElement("input", {
    className: "f-in",
    type: "number",
    value: reimbForm.amount,
    onChange: e => setReimbForm(f => ({
      ...f,
      amount: e.target.value
    })),
    placeholder: "0"
  })), /*#__PURE__*/React.createElement("div", {
    className: "fg"
  }, /*#__PURE__*/React.createElement("label", {
    className: "fl"
  }, "Category"), /*#__PURE__*/React.createElement("select", {
    className: "f-in f-sel",
    value: reimbForm.category,
    onChange: e => setReimbForm(f => ({
      ...f,
      category: e.target.value
    }))
  }, ['Travel', 'Meals', 'Office', 'Medical', 'Other'].map(c => /*#__PURE__*/React.createElement("option", {
    key: c
  }, c))))), /*#__PURE__*/React.createElement("div", {
    className: "fg"
  }, /*#__PURE__*/React.createElement("label", {
    className: "fl"
  }, "Note"), /*#__PURE__*/React.createElement("textarea", {
    className: "f-in",
    rows: 2,
    value: reimbForm.note,
    onChange: e => setReimbForm(f => ({
      ...f,
      note: e.target.value
    })),
    placeholder: "Additional details..."
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--s2)',
      border: '2px dashed var(--br2)',
      borderRadius: 9,
      padding: '14px',
      textAlign: 'center',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "doc",
    size: 22,
    color: "var(--t3)"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--t2)',
      fontWeight: 500
    }
  }, "Upload Receipt"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: 'var(--t3)'
    }
  }, "PNG, JPG, PDF \xB7 Max 5MB"))), /*#__PURE__*/React.createElement("div", {
    className: "modal-foot"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn bs btn-full",
    onClick: () => setReimbModal(false)
  }, "Cancel"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-full",
    style: {
      background: t.acc,
      color: '#fff'
    },
    onClick: handleSubmitReimb
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "send",
    size: 13,
    color: "#fff"
  }), "Submit")))), sideOpen && /*#__PURE__*/React.createElement("div", {
    className: "mob-overlay on",
    onClick: () => setSideOpen(false)
  }), /*#__PURE__*/React.createElement("aside", {
    className: "sb",
    style: sideOpen ? {
      transform: 'translateX(0)'
    } : {}
  }, /*#__PURE__*/React.createElement("div", {
    className: "sb-logo"
  }, /*#__PURE__*/React.createElement("div", {
    className: "logo-m",
    style: {
      background: t.logoGrad,
      boxShadow: t.logoShadow
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "user",
    size: 18,
    color: "#fff"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "logo-n"
  }, "City Homes"), /*#__PURE__*/React.createElement("div", {
    className: "logo-s"
  }, /*#__PURE__*/React.createElement("span", {
    className: "role-tag",
    style: {
      background: t.tagBg,
      color: t.tagColor
    }
  }, "Employee")))), /*#__PURE__*/React.createElement("div", {
    className: "nav"
  }, /*#__PURE__*/React.createElement("div", {
    className: "nl"
  }, "Main"), navItems.map(n => /*#__PURE__*/React.createElement("div", {
    key: n.id,
    className: `ni ${page === n.id ? 'active' : ''}`,
    style: page === n.id ? {
      background: t.accDim,
      color: t.acc
    } : {},
    onClick: () => go(n.id)
  }, /*#__PURE__*/React.createElement(Icon, {
    n: n.ic,
    size: 15,
    color: page === n.id ? t.acc : 'var(--t2)'
  }), /*#__PURE__*/React.createElement("span", null, n.l), n.id === 'notif' && myNotifs.length > 0 && /*#__PURE__*/React.createElement("span", {
    className: "nb nb-r"
  }, myNotifs.length)))), /*#__PURE__*/React.createElement("div", {
    className: "sb-bot"
  }, /*#__PURE__*/React.createElement("div", {
    className: "uc"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ua",
    style: {
      background: t.logoGrad
    }
  }, t.tag), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "un"
  }, emp?.name.split(' ')[0] || 'Employee'), /*#__PURE__*/React.createElement("div", {
    className: "ur"
  }, emp?.role || ''))), /*#__PURE__*/React.createElement("button", {
    className: "logout-btn",
    onClick: onLogout
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "logout",
    size: 14,
    color: "var(--red)"
  }), "Logout"))), /*#__PURE__*/React.createElement("div", {
    className: "tb"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hamb",
    onClick: () => setSideOpen(!sideOpen)
  }, /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("span", null)), /*#__PURE__*/React.createElement("div", {
    className: "tb-t"
  }, navItems.find(n => n.id === page)?.l || 'My Dashboard'), /*#__PURE__*/React.createElement("div", {
    className: "tb-r"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn",
    style: {
      background: t.acc,
      color: '#fff',
      fontSize: 12,
      fontWeight: 700,
      padding: '8px 14px'
    },
    onClick: () => setShowAttModal(true)
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "clock",
    size: 14,
    color: "#fff"
  }), "Mark Attendance"), /*#__PURE__*/React.createElement("div", {
    className: "ib",
    onClick: () => go('notif'),
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "bell",
    size: 16,
    color: "var(--t2)"
  }), myNotifs.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "nd",
    style: {
      top: 5,
      right: 5
    }
  })), /*#__PURE__*/React.createElement(Av, {
    name: emp?.name || 'E',
    size: 30,
    r: 8
  }))), /*#__PURE__*/React.createElement("div", {
    className: "main"
  }, /*#__PURE__*/React.createElement("div", {
    className: `pg ${page === 'home' ? 'on' : ''}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "ph"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "pt"
  }, "Hi, ", emp?.name.split(' ')[0] || 'Employee'), /*#__PURE__*/React.createElement("div", {
    className: "ps"
  }, "Saturday, 21 Mar 2026"))), /*#__PURE__*/React.createElement("div", {
    className: "cd",
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'linear-gradient(135deg,var(--s3),var(--s2))',
      padding: 22,
      textAlign: 'center',
      borderBottom: '1px solid var(--br)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 72,
      height: 72,
      borderRadius: '50%',
      background: `linear-gradient(135deg,${AC[(emp?.name.charCodeAt(0) || 0) % AC.length]},${AC[((emp?.name.charCodeAt(0) || 0) + 2) % AC.length]})`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 24,
      fontWeight: 800,
      color: '#fff',
      margin: '0 auto 10px',
      border: `3px solid ${t.acc}30`
    }
  }, emp?.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'E'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 800,
      color: 'var(--t1)',
      marginBottom: 2
    }
  }, emp?.name || 'Employee'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--t2)',
      marginBottom: 6
    }
  }, emp?.role, " \xB7 ", emp?.dept), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '4px 12px',
      borderRadius: 12,
      background: 'var(--gd)',
      color: 'var(--grn)',
      fontSize: 11,
      fontWeight: 600
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 7,
      height: 7,
      borderRadius: '50%',
      background: 'var(--grn)'
    }
  }), "Active")), /*#__PURE__*/React.createElement("div", {
    className: "info-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "info-cell"
  }, /*#__PURE__*/React.createElement("div", {
    className: "info-lbl"
  }, "Employee ID"), /*#__PURE__*/React.createElement("div", {
    className: "info-val"
  }, "EMP-00", emp?.id)), /*#__PURE__*/React.createElement("div", {
    className: "info-cell"
  }, /*#__PURE__*/React.createElement("div", {
    className: "info-lbl"
  }, "Department"), /*#__PURE__*/React.createElement("div", {
    className: "info-val"
  }, emp?.dept)), /*#__PURE__*/React.createElement("div", {
    className: "info-cell"
  }, /*#__PURE__*/React.createElement("div", {
    className: "info-lbl"
  }, "Today's Status"), /*#__PURE__*/React.createElement("div", {
    className: "info-val"
  }, /*#__PURE__*/React.createElement("span", {
    className: `bg ${empPunchStatus === 'in' ? 'bg-in' : 'bg-pend'}`,
    style: {
      fontSize: 10
    }
  }, empPunchStatus === 'in' ? 'Punched In' : 'Not Punched'))), /*#__PURE__*/React.createElement("div", {
    className: "info-cell"
  }, /*#__PURE__*/React.createElement("div", {
    className: "info-lbl"
  }, "This Month"), /*#__PURE__*/React.createElement("div", {
    className: "info-val"
  }, empAttSummary.present, " Present")))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      gap: 10
    }
  }, [{
    ic: 'calendar',
    l: 'Attendance',
    p: 'att'
  }, {
    ic: 'leave',
    l: 'Apply Leave',
    fn: () => setLeaveModal(true)
  }, {
    ic: 'receipt',
    l: 'Reimburse',
    fn: () => setReimbModal(true)
  }, {
    ic: 'dollar',
    l: 'Salary',
    p: 'salary'
  }].map(s => /*#__PURE__*/React.createElement("div", {
    key: s.l,
    className: "qa",
    onClick: s.fn || (() => go(s.p))
  }, /*#__PURE__*/React.createElement("div", {
    className: "qi"
  }, /*#__PURE__*/React.createElement(Icon, {
    n: s.ic,
    size: 20,
    color: t.acc
  })), /*#__PURE__*/React.createElement("div", {
    className: "ql"
  }, s.l))))), /*#__PURE__*/React.createElement("div", {
    className: `pg ${page === 'att' ? 'on' : ''}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "ph"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "pt"
  }, "My Attendance"), /*#__PURE__*/React.createElement("div", {
    className: "ps"
  }, empAttendanceMonthLabel, " · Attendance calendar and monthly report"))), /*#__PURE__*/React.createElement("div", {
    className: "cal-sum"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cal-col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cal-n",
    style: {
      color: 'var(--grn)'
    }
  }, empAttSummary.present), /*#__PURE__*/React.createElement("div", {
    className: "cal-l"
  }, "Present")), /*#__PURE__*/React.createElement("div", {
    className: "cal-col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cal-n",
    style: {
      color: 'var(--red)'
    }
  }, empAttSummary.absent), /*#__PURE__*/React.createElement("div", {
    className: "cal-l"
  }, "Absent")), /*#__PURE__*/React.createElement("div", {
    className: "cal-col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cal-n",
    style: {
      color: 'var(--teal)'
    }
  }, empAttSummary.holiday), /*#__PURE__*/React.createElement("div", {
    className: "cal-l"
  }, "Holiday")), /*#__PURE__*/React.createElement("div", {
    className: "cal-col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cal-n",
    style: {
      color: 'var(--amb)'
    }
  }, empAttSummary.halfDay), /*#__PURE__*/React.createElement("div", {
    className: "cal-l"
  }, "Half Day")), /*#__PURE__*/React.createElement("div", {
    className: "cal-col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cal-n",
    style: {
      color: 'var(--pur)'
    }
  }, empAttSummary.paidLeave), /*#__PURE__*/React.createElement("div", {
    className: "cal-l"
  }, "Paid Leave")), /*#__PURE__*/React.createElement("div", {
    className: "cal-col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cal-n",
    style: {
      color: 'var(--blu)'
    }
  }, empAttSummary.weekOff), /*#__PURE__*/React.createElement("div", {
    className: "cal-l"
  }, "Week Off"))), /*#__PURE__*/React.createElement("div", {
    className: "cd"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
      flexWrap: 'wrap',
      padding: '12px 14px',
      borderBottom: '1px solid var(--br)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: 'var(--t1)'
    }
  }, "Attendance Calendar"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--t2)'
    }
  }, "Present, absent, holiday, leave and week off overview")), /*#__PURE__*/React.createElement("button", {
    className: "btn bs btn-sm",
    onClick: downloadEmpAttendanceReport
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "download",
    size: 13
  }), "Download Report")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '12px 17px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "dnb dnl",
    style: {
      background: t.acc,
      width: 28,
      height: 28,
      fontSize: 16
    },
    onClick: () => changeEmpAttendanceMonth(-1)
  }, "‹"), /*#__PURE__*/React.createElement("div", {
    className: "dl",
    style: {
      flex: 1,
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "calendar",
    size: 13,
    color: "var(--t2)"
  }), " ", empAttendanceMonthLabel), /*#__PURE__*/React.createElement("button", {
    className: "dnb dnr",
    style: {
      width: 28,
      height: 28,
      fontSize: 16
    },
    onClick: () => changeEmpAttendanceMonth(1)
  }, "›")), empAttLoading ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 17px 17px',
      fontSize: 12,
      color: 'var(--t2)',
      textAlign: 'center'
    }
  }, "Loading attendance...") : /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 17px 17px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "cg",
    style: {
      marginBottom: 8
    }
  }, ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => /*#__PURE__*/React.createElement("div", {
    key: d,
    className: "ch"
  }, d))), /*#__PURE__*/React.createElement("div", {
    className: "cg"
  }, Array.from({
    length: new Date(empAttYear, empAttMonth - 1, 1).getDay()
  }, (_, i) => /*#__PURE__*/React.createElement("div", {
    key: `e${i}`,
    className: "day de"
  })), Array.from({
    length: new Date(empAttYear, empAttMonth, 0).getDate()
  }, (_, i) => {
    const dayNum = i + 1;
    const d = String(dayNum).padStart(2, '0');
    const dayData = empAttData[d] || {};
    const st = mapSelfAttendanceStatus(dayData.status || (new Date(empAttYear, empAttMonth - 1, dayNum) > new Date() ? 'future' : 'absent_pending'));
    const cls = {
      p: 'dp',
      a: 'da',
      h: 'dh',
      w: 'dw',
      hol: 'dhol',
      pl: 'dpl',
      ul: 'da',
      f: 'df'
    }[st] || 'dw';
    const monthText = new Date(empAttYear, empAttMonth - 1, dayNum).toLocaleDateString('en-GB', {
      month: 'short'
    });
    const statusText = {
      p: 'PRESENT',
      a: 'ABSENT',
      h: 'HALF DAY',
      w: 'WEEK OFF',
      hol: 'HOLIDAY',
      pl: 'PAID LEAVE',
      ul: 'UNPAID LEAVE',
      f: ''
    }[st] || '';
    return /*#__PURE__*/React.createElement("div", {
      key: d,
      className: `day ${cls}`
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'center',
        gap: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "day-num"
    }, d), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 9,
        fontWeight: 700,
        color: 'var(--t2)',
        textTransform: 'uppercase'
      }
    }, monthText)), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        marginTop: 2,
        fontSize: 8,
        fontWeight: 600,
        color: 'var(--t2)'
      }
    }, String(empAttYear)), statusText && /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        marginTop: 10,
        fontSize: 8.5,
        fontWeight: 700,
        color: st === 'p' ? 'var(--grn)' : st === 'a' || st === 'ul' ? 'var(--red)' : st === 'hol' ? 'var(--teal)' : st === 'pl' ? 'var(--pur)' : st === 'w' ? 'var(--blu)' : 'var(--amb)',
        textTransform: 'uppercase',
        letterSpacing: '.3px'
      }
    }, statusText), dayData.isLate && st === 'p' && /*#__PURE__*/React.createElement("span", {
      className: "dt-late"
    }, "LATE"));
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 17px 13px',
      borderTop: '1px solid var(--br)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 600,
      color: 'var(--t2)'
    }
  }, "Selected month: ", empAttendanceMonthLabel), /*#__PURE__*/React.createElement("button", {
    className: "btn bs btn-sm",
    onClick: () => setShowAttModal(true)
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "clock",
    size: 13
  }), empPunchStatus === 'in' ? 'Punch Out' : 'Mark Attendance'))), /*#__PURE__*/React.createElement("div", {
    className: `pg ${page === 'salary' ? 'on' : ''}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "ph"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "pt"
  }, "My Salary"), /*#__PURE__*/React.createElement("div", {
    className: "ps"
  }, empSalaryMonthLabel, " · Attendance-based salary view"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: 10,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "sc",
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--t2)',
      marginBottom: 4
    }
  }, "Basic Salary"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 800,
      color: 'var(--t1)'
    }
  }, "\u20B9", (displaySd.basic || 0).toLocaleString())), /*#__PURE__*/React.createElement("div", {
    className: "sc",
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--t2)',
      marginBottom: 4
    }
  }, "Deductions (LOP)"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 800,
      color: 'var(--red)'
    }
  }, "-\u20B9", (displayEmpSal.lopAmt || 0).toLocaleString()), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: 'var(--t3)'
    }
  }, displayEmpSal.lopDays || 0, " day(s) absent")), /*#__PURE__*/React.createElement("div", {
    className: "sc",
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--t2)',
      marginBottom: 4
    }
  }, "Net Payable"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 800,
      color: 'var(--teal)'
    }
  }, "\u20B9", (displayEmpSal.payable || 0).toLocaleString()))), /*#__PURE__*/React.createElement("div", {
    className: "cd"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '11px 17px',
      borderBottom: '1px solid var(--br)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "dnb dnl",
    style: {
      background: t.acc,
      width: 28,
      height: 28,
      fontSize: 16
    },
    onClick: () => changeEmpSalaryMonth(-1)
  }, "\u2039"), /*#__PURE__*/React.createElement("div", {
    className: "dl",
    style: {
      flex: 1,
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "calendar",
    size: 13,
    color: "var(--t2)"
  }), " ", empSalaryMonthLabel), /*#__PURE__*/React.createElement("button", {
    className: "dnb dnr",
    style: {
      width: 28,
      height: 28,
      fontSize: 16
    },
    onClick: () => changeEmpSalaryMonth(1)
  }, "\u203A")), /*#__PURE__*/React.createElement("div", {
    className: "salr sal-p"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sall"
  }, "Net Payable Amount"), /*#__PURE__*/React.createElement("span", {
    className: "salv"
  }, "\u20B9", (empSal.payable || 0).toLocaleString())), /*#__PURE__*/React.createElement("div", {
    className: "salr"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sall"
  }, "Attendance Calculation"), /*#__PURE__*/React.createElement("span", {
    className: "salv",
    style: {
      fontSize: 11
    }
  }, "\u20B9", (displaySd.basic || 0).toLocaleString(), " \xF7 ", displayEmpSal.totalDays || 31, "d \xD7 (", displayEmpSal.presentDays || 0, " + ", displayEmpSal.weekoffs || 0, "WO + ", displayEmpSal.paidHols || 0, "H)")), /*#__PURE__*/React.createElement("div", {
    className: "salr"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sall"
  }, "Present Days"), /*#__PURE__*/React.createElement("span", {
    className: "salv"
  }, displayEmpSal.presentDays || 0, " days")), /*#__PURE__*/React.createElement("div", {
    className: "salr"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sall"
  }, "Weekly Off (Paid)"), /*#__PURE__*/React.createElement("span", {
    className: "salv",
    style: {
      color: 'var(--grn)'
    }
  }, displayEmpSal.weekoffs || 0, " days")), (displayEmpSal.paidHols || 0) > 0 && /*#__PURE__*/React.createElement("div", {
    className: "salr"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sall"
  }, "Paid Holidays"), /*#__PURE__*/React.createElement("span", {
    className: "salv",
    style: {
      color: 'var(--grn)'
    }
  }, empSal.paidHols, " days")), /*#__PURE__*/React.createElement("div", {
    className: "salr sal-eh"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sall"
  }, "Gross Earnings"), /*#__PURE__*/React.createElement("span", {
    className: "salv"
  }, "\u20B9", (displayEmpSal.gross || 0).toLocaleString())), [['Basic', displayEmpSal.earnedBasic || 0], ['HRA', displaySd.hra || 0], ['DA', displaySd.da || 0], ['Bonus', displaySd.bonus || 0], ['Overtime', displaySd.overtime || 0], ['Incentive', displaySd.incentive || 0]].map(([l, v]) => /*#__PURE__*/React.createElement("div", {
    key: l,
    className: "salr"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sall"
  }, l), /*#__PURE__*/React.createElement("span", {
    className: "salv"
  }, "\u20B9", Number(v).toLocaleString()))), (empSal.lopAmt || 0) > 0 && /*#__PURE__*/React.createElement("div", {
    className: "salr",
    style: {
      borderTop: '1px solid var(--br)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "sall",
    style: {
      color: 'var(--red)'
    }
  }, "LOP Deduction (", displayEmpSal.lopDays || 0, " absent days)"), /*#__PURE__*/React.createElement("span", {
    className: "salv",
    style: {
      color: 'var(--red)'
    }
  }, "-\u20B9", (displayEmpSal.lopAmt || 0).toLocaleString())), empReimbApproved > 0 && /*#__PURE__*/React.createElement("div", {
    className: "salr"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sall",
    style: {
      color: 'var(--grn)'
    }
  }, "Reimbursement Added"), /*#__PURE__*/React.createElement("span", {
    className: "salv",
    style: {
      color: 'var(--grn)'
    }
  }, "+\u20B9", empReimbApproved.toLocaleString())), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '13px 17px',
      borderTop: '1px solid var(--br)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 600,
      color: 'var(--t2)'
    }
  }, "Selected month: ", empSalaryMonthLabel), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-full",
    style: {
      background: t.acc,
      color: '#fff',
      maxWidth: 320
    },
    onClick: () => setEmpShowPayslip({
      empData: emp,
      salData: {
        ...sd,
        month: empSalMonth,
        year: empSalYear
      },
      month: empSalMonth,
      year: empSalYear
    })
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "download",
    size: 13,
    color: "#fff"
  }), "View / Download Pay Slip")))), /*#__PURE__*/React.createElement("div", {
    className: `pg ${page === 'leaves' ? 'on' : ''}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "ph"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "pt"
  }, "Leave Requests")), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-sm",
    style: {
      background: t.acc,
      color: '#fff'
    },
    onClick: () => setLeaveModal(true)
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "plus",
    size: 13,
    color: "#fff"
  }), "Apply Leave")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: 8,
      marginBottom: 14
    }
  }, [['Paid Leave', '8', 'var(--grn)'], ['Casual', '5', 'var(--blu)'], ['Sick', '6', 'var(--pur)']].map(([l, v, c]) => /*#__PURE__*/React.createElement("div", {
    key: l,
    style: {
      textAlign: 'center',
      background: 'var(--s1)',
      border: '1px solid var(--br)',
      borderRadius: 10,
      padding: '10px 6px',
      boxShadow: 'var(--shadow)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 800,
      color: c
    }
  }, v, " days"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: 'var(--t2)',
      marginTop: 2
    }
  }, l)))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      marginBottom: 8,
      color: 'var(--t1)'
    }
  }, "My Requests"), myLeaves.map(r => /*#__PURE__*/React.createElement("div", {
    key: r.id,
    className: "lrc"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lrc-top"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "lrc-nm"
  }, r.type), /*#__PURE__*/React.createElement("div", {
    className: "lrc-ty"
  }, r.from, " \u2013 ", r.to, " \xB7 ", r.days, " day", r.days !== 1 ? 's' : '')), /*#__PURE__*/React.createElement("span", {
    className: `bg ${r.status === 'pending' ? 'bg-pend' : r.status === 'approved' ? 'bg-appr' : 'bg-rej'}`,
    style: {
      fontSize: 9
    }
  }, r.status.charAt(0).toUpperCase() + r.status.slice(1))), /*#__PURE__*/React.createElement("div", {
    className: "lrc-rs"
  }, r.reason), r.rejReason && /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--rd)',
      borderRadius: 7,
      padding: '6px 10px',
      fontSize: 11,
      color: 'var(--red)',
      display: 'flex',
      alignItems: 'center',
      gap: 5
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "alert",
    size: 12,
    color: "var(--red)"
  }), "Reason: ", r.rejReason))), myLeaves.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '30px',
      color: 'var(--t3)',
      fontSize: 12
    }
  }, "No leave requests yet")), /*#__PURE__*/React.createElement("div", {
    className: `pg ${page === 'reimburse' ? 'on' : ''}`
  }, viewReceiptData && /*#__PURE__*/React.createElement(ReceiptModal, {
    url: viewReceiptData.url,
    title: viewReceiptData.title,
    onClose: () => setViewReceiptData(null)
  }), /*#__PURE__*/React.createElement("div", {
    className: "ph"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "pt"
  }, "Reimbursement"), /*#__PURE__*/React.createElement("div", {
    className: "ps"
  }, "Submit and track your expenses")), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-sm",
    style: {
      background: t.acc,
      color: '#fff'
    },
    onClick: () => setReimbModal(true)
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "plus",
    size: 13,
    color: "#fff"
  }), "New Request")), empReimbApproved > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'rgba(22,163,74,0.07)',
      border: '1px solid rgba(22,163,74,0.2)',
      borderRadius: 10,
      padding: '10px 14px',
      marginBottom: 14,
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "check",
    size: 15,
    color: "var(--grn)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'var(--t1)'
    }
  }, "\u20B9", empReimbApproved.toLocaleString(), " approved reimbursement has been added to your salary.")), myReimb.map(r => /*#__PURE__*/React.createElement("div", {
    key: r.id,
    className: "reimb-card"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: 'var(--t1)',
      marginBottom: 3
    }
  }, r.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--t2)'
    }
  }, r.category, " \xB7 ", r.date)), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 800,
      color: 'var(--grn)'
    }
  }, "\u20B9", r.amount.toLocaleString()), /*#__PURE__*/React.createElement("span", {
    className: `bg ${r.status === 'pending' ? 'bg-pend' : r.status === 'approved' ? 'bg-appr' : 'bg-rej'}`,
    style: {
      fontSize: 9,
      display: 'block',
      marginTop: 4
    }
  }, r.status.charAt(0).toUpperCase() + r.status.slice(1)))), r.rejReason && /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--rd)',
      borderRadius: 7,
      padding: '7px 10px',
      fontSize: 11,
      color: 'var(--red)',
      marginBottom: 8,
      display: 'flex',
      alignItems: 'center',
      gap: 5
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "alert",
    size: 12,
    color: "var(--red)"
  }), "Rejected: ", r.rejReason), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '6px 10px',
      background: 'var(--s2)',
      borderRadius: 7,
      border: '1px solid var(--br)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "doc",
    size: 13,
    color: "var(--t2)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: 'var(--t2)',
      flex: 1
    }
  }, "Receipt uploaded"), r.receipt && r.receipt !== 'uploaded' && /*#__PURE__*/React.createElement("button", {
    style: {
      background: 'none',
      border: 'none',
      color: 'var(--blu)',
      fontSize: 11,
      cursor: 'pointer',
      fontWeight: 600,
      fontFamily: 'Inter',
      display: 'flex',
      alignItems: 'center',
      gap: 3
    },
    onClick: () => setViewReceiptData({
      url: r.receipt,
      title: r.title
    })
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "eye",
    size: 12,
    color: "var(--blu)"
  }), "View")))), myReimb.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '40px',
      color: 'var(--t3)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "receipt",
    size: 36,
    color: "var(--t3)"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--t2)',
      marginTop: 10
    }
  }, "No reimbursements yet"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--t3)',
      marginTop: 4
    }
  }, "Submit your first expense claim"))), /*#__PURE__*/React.createElement("div", {
    className: `pg ${page === 'notif' ? 'on' : ''}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "ph"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "pt"
  }, "Notifications"), /*#__PURE__*/React.createElement("div", {
    className: "ps"
  }, myNotifs.length, " notification", myNotifs.length !== 1 ? 's' : ''))), myNotifs.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '60px 20px',
      color: 'var(--t3)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "bell",
    size: 36,
    color: "var(--t3)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--t2)'
    }
  }, "No notifications yet"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      marginTop: 4
    }
  }, "You'll be notified here when SA or HR takes action on your requests.")), myNotifs.map(n => /*#__PURE__*/React.createElement("div", {
    key: n.id,
    className: "cd",
    style: {
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 17px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      borderRadius: 10,
      background: `${n.color}15`,
      border: `1px solid ${n.color}30`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: n.type === 'salary' ? 'dollar' : n.type === 'reimb_appr' || n.type === 'reimb_rej' ? 'receipt' : n.type.includes('rej') ? 'x' : 'check',
    size: 17,
    color: n.color
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: 'var(--t1)',
      marginBottom: 3
    }
  }, n.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--t2)',
      lineHeight: 1.5
    }
  }, n.body), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: 'var(--t3)',
      marginTop: 5,
      display: 'flex',
      alignItems: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "clock",
    size: 11,
    color: "var(--t3)"
  }), n.time)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      fontWeight: 700,
      padding: '2px 7px',
      borderRadius: 5,
      background: `${n.color}15`,
      color: n.color
    }
  }, n.type === 'salary' ? 'Salary' : n.type.includes('reimb') ? 'Reimburse' : 'Leave'))))), /*#__PURE__*/React.createElement("div", {
    className: `pg ${page === 'profile' ? 'on' : ''}`
  }, /*#__PURE__*/React.createElement(EmpDetail, {
    emp: emp,
    onBack: () => go('home'),
    accentColor: t.acc,
    userRole: "employee",
    salaryData: salaryData,
    salarySettings: salarySettings,
    globalReimb: globalReimb,
    yearlyHolidays: yearlyHolidays,
    setGlobalActivity: setGlobalActivity
  })), /*#__PURE__*/React.createElement("div", {
    className: `pg ${page === 'docs' ? 'on' : ''}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "ph"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "pt"
  }, "Documents"))), /*#__PURE__*/React.createElement("div", {
    className: "cd"
  }, [{
    ic: 'clipboard',
    l: 'Offer Letter',
    s: 'Jan 2024'
  }, {
    ic: 'clipboard',
    l: 'Appointment Letter',
    s: 'Jan 2024'
  }, {
    ic: 'dollar',
    l: 'Salary Slips',
    s: 'View all'
  }, {
    ic: 'shield',
    l: 'PF Statement',
    s: 'FY 2024-25'
  }, {
    ic: 'doc',
    l: 'ID Proof',
    s: 'Aadhaar uploaded'
  }, {
    ic: 'bank',
    l: 'Bank Statement',
    s: 'Last 3 months'
  }].map(({
    ic,
    l,
    s
  }) => /*#__PURE__*/React.createElement("div", {
    key: l,
    className: "sr"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sic"
  }, /*#__PURE__*/React.createElement(Icon, {
    n: ic,
    size: 15,
    color: "var(--t2)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "slb"
  }, l), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: 'var(--t3)'
    }
  }, s)), /*#__PURE__*/React.createElement("button", {
    className: "btn bs btn-sm",
    style: {
      fontSize: 10,
      padding: '3px 8px'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "download",
    size: 11
  }), "Download")))))), showAttModal && /*#__PURE__*/React.createElement(AttendanceModal, {
    onClose: () => setShowAttModal(false),
    userName: user.name,
    geoSettings: geoSettings,
    currentStatus: emp?.ls === 'in' ? 'in' : 'out',
    branchId: emp?.branch || 'b1',
    onSuccess: (type, time, addr) => {
      // Refresh status if needed
      alert(`Success: Punched ${type === 'in' ? 'In' : 'Out'} at ${time}`);
    }
  })));
};

// ─── LEAVE FORM COMPONENT ────────────────────────────────────────────────
const LeaveForm = ({
  onSubmit,
  onCancel,
  accentColor
}) => {
  const [type, setType] = useState('Sick Leave');
  const [from, setFrom] = useState('2026-03-22');
  const [to, setTo] = useState('2026-03-23');
  const [reason, setReason] = useState('');
  const calcDays = () => {
    const d = new Date(to) - new Date(from);
    return Math.max(1, Math.round(d / 86400000) + 1);
  };
  const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fmtDate = d => {
    const p = d.split('-');
    return `${parseInt(p[2])} ${MONTHS_SHORT[parseInt(p[1]) - 1]} ${p[0]}`;
  };
  const handle = () => onSubmit(type, fmtDate(from), fmtDate(to), calcDays(), reason);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "modal-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fg"
  }, /*#__PURE__*/React.createElement("label", {
    className: "fl"
  }, "Leave Type"), /*#__PURE__*/React.createElement("select", {
    className: "f-in f-sel",
    value: type,
    onChange: e => setType(e.target.value)
  }, /*#__PURE__*/React.createElement("option", null, "Sick Leave"), /*#__PURE__*/React.createElement("option", null, "Casual Leave"), /*#__PURE__*/React.createElement("option", null, "Earned Leave"), /*#__PURE__*/React.createElement("option", null, "Half Day"), /*#__PURE__*/React.createElement("option", null, "Unpaid Leave"))), /*#__PURE__*/React.createElement("div", {
    className: "fr"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fg"
  }, /*#__PURE__*/React.createElement("label", {
    className: "fl"
  }, "From Date"), /*#__PURE__*/React.createElement("input", {
    className: "f-in",
    type: "date",
    value: from,
    onChange: e => setFrom(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "fg"
  }, /*#__PURE__*/React.createElement("label", {
    className: "fl"
  }, "To Date"), /*#__PURE__*/React.createElement("input", {
    className: "f-in",
    type: "date",
    value: to,
    onChange: e => setTo(e.target.value)
  }))), /*#__PURE__*/React.createElement("div", {
    className: "fg"
  }, /*#__PURE__*/React.createElement("label", {
    className: "fl"
  }, "Reason"), /*#__PURE__*/React.createElement("textarea", {
    className: "f-in",
    rows: 3,
    placeholder: "Enter reason...",
    value: reason,
    onChange: e => setReason(e.target.value),
    style: {
      resize: 'vertical'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    className: "modal-foot"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn bs btn-full",
    onClick: onCancel
  }, "Cancel"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-full",
    style: {
      background: accentColor,
      color: '#fff'
    },
    onClick: handle
  }, /*#__PURE__*/React.createElement(Icon, {
    n: "send",
    size: 13,
    color: "#fff"
  }), "Submit Request")));
};

// ─── ROOT APP ─────────────────────────────────────────────────────────────
const App = () => {
  const [user, setUser] = useState(null);
  const [geoSettings, setGeoSettings] = useState(DEFAULT_GEO);
  const [globalStaff, setGlobalStaff] = useState([]);
  const [globalLeaves, setGlobalLeaves] = useState([]);
  const [globalActivity, setGlobalActivity] = useState([]);
  const [globalBranches, setGlobalBranches] = useState([]);
  const [globalReimb, setGlobalReimb] = useState([]);
  const [salarySettings, setSalarySettings] = useState(DEFAULT_SALARY_SETTINGS);
  const [backendOnline, setBackendOnline] = useState(true);
  const [salaryData, setSalaryData] = useState({});
  const [empNotifs, setEmpNotifs] = useState({});
  const [yearlyHolidays, setYearlyHolidays] = useState({});
  const [lastBirthdayCheck, setLastBirthdayCheck] = useState(null);

  // Check for saved user session on app load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('userAuth');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          if (userData && userData.role) {
            setUser({
              ...userData,
              role: normalizeUserRole(userData.role)
            });
          } else {
            localStorage.removeItem('userAuth');
          }
        } catch (e) {
          localStorage.removeItem('userAuth');
        }
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.fetch) return;
    const originalFetch = window.fetch.bind(window);
    const listPattern = /\/(employees|branches|leaves|reimbursements|holidays|departments|payroll)(\?|$)/;
    const getFallbackJson = async url => {
      const path = String(url).split('?')[0];
      if (listPattern.test(path)) return [];
      return {};
    };
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        if (response && response.ok) {
          setBackendOnline(true);
        }
        return response;
      } catch (error) {
        setBackendOnline(false);
        const url = args[0] || '';
        return {
          ok: false,
          status: 0,
          json: async () => getFallbackJson(url),
          text: async () => '',
          clone: () => ({ ok: false, status: 0, json: async () => getFallbackJson(url), text: async () => '' })
        };
      }
    };
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  // Fetch initial data from backend
  useEffect(() => {
    if (user) {
      const safeJson = async (r) => {
        if (!r.ok) return [];
        const data = await r.json();
        return Array.isArray(data) ? data : [];
      };

      if (user.role === 'employee') {
        fetch(`/employees/${user.id}`, { credentials: 'include' })
          .then(async response => {
            if (!response.ok) throw new Error('Failed to fetch employee profile');
            return response.json();
          })
          .then(data => setGlobalStaff([{
            ...data,
            dept: data.department?.name || '—',
            branch: data.branch?.id || 'b1',
            role: data.designation || data.role || 'Employee',
            phone: data.phone || '—',
            ls: data.ls || 'out'
          }]))
          .catch(e => {
            console.error(e);
            setGlobalStaff([{
              ...data,
              dept: data.department?.name || '�',
              branch: data.branch?.id || 'b1',
              role: data.designation || data.role || 'Employee',
              phone: data.phone || '�',
              ls: data.ls || 'out'
            }]);
          });
      } else {
        // Fetch staff for HR/Superadmin
        fetch(`${API_BASE}/employees`, { credentials: 'include' })
          .then(safeJson)
          .then(data => setGlobalStaff(data.map(s => ({
            ...s,
            dept: s.department?.name || '—',
            branch: s.branch?.id || 'b1',
            role: s.designation || s.role || 'Employee'
          }))))
          .catch(e => console.error(e));
      }

      // Fetch leaves and reimbursements for HR/Superadmin only (employee may not have permission)
      if (user.role !== 'employee') {
        fetch(`${API_BASE}/leaves`, { credentials: 'include' })
          .then(safeJson)
          .then(data => setGlobalLeaves(data.map(l => ({
            ...l,
            name: l.employee?.name,
            from: new Date(l.from_date).toLocaleDateString(),
            to: new Date(l.to_date).toLocaleDateString(),
            days: Math.ceil((new Date(l.to_date).getTime() - new Date(l.from_date).getTime()) / (1000 * 60 * 60 * 24)) + 1
          }))))
          .catch(e => console.error(e));

        fetch(`${API_BASE}/reimbursements`, { credentials: 'include' })
          .then(safeJson)
          .then(data => setGlobalReimb(data.map(r => ({
            ...r,
            name: r.employee?.name,
            date: new Date(r.created_at).toLocaleDateString(),
            title: r.description
          }))))
          .catch(e => console.error(e));
      } else {
        setGlobalLeaves([]);
        setGlobalReimb([]);
      }

      // Fetch branches
      fetch(`${API_BASE}/branches`, { credentials: 'include' })
        .then(safeJson)
        .then(data => setGlobalBranches(data))
        .catch(e => console.error(e));
    }
  }, [user]);

  const addEmpNotif = useCallback((empName, notif) => {
    setEmpNotifs(n => ({
      ...n,
      [empName]: [{
        id: Date.now(),
        ...notif
      }, ...(n[empName] || [])]
    }));
  }, [setEmpNotifs]);

  // Holiday notification: 1 day before each holiday, notify all employees
  useEffect(() => {
    const checkHolidays = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tYear = tomorrow.getFullYear();
      const tMonth = tomorrow.getMonth() + 1;
      const tDay = tomorrow.getDate();
      const monthHols = (yearlyHolidays[tYear] || {})[tMonth] || [];
      if (monthHols.includes(tDay)) {
        const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const msg = `Tomorrow ${tDay} ${MONTH_NAMES[tMonth - 1]} is a Paid Holiday. Office will be closed.`;
        globalStaff.forEach(s => {
          setEmpNotifs(n => {
            const existing = n[s.name] || [];
            // avoid duplicate
            if (existing.some(x => x.body === msg)) return n;
            return {
              ...n,
              [s.name]: [{
                id: Date.now() + s.id,
                type: 'holiday',
                title: 'Holiday Tomorrow',
                body: msg,
                time: 'Auto Reminder',
                color: 'var(--teal)'
              }, ...existing]
            };
          });
        });
      }
    };
    checkHolidays();
    const interval = setInterval(checkHolidays, 60 * 60 * 1000); // check every hour
    return () => clearInterval(interval);
  }, [yearlyHolidays, globalStaff]);

  // Birthday notification: Today matching employee birthdays
  useEffect(() => {
    const today = new Date();
    const checkKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    if (lastBirthdayCheck === checkKey) return;
    setLastBirthdayCheck(checkKey);

    if (!globalStaff || globalStaff.length === 0) return;

    const birthdaysToday = globalStaff.filter(emp => {
      const dob = emp.date_of_birth || emp.dob;
      if (!dob) return false;
      const d = new Date(dob);
      if (Number.isNaN(d.getTime())) return false;
      return d.getDate() === today.getDate() && d.getMonth() === today.getMonth();
    });

    if (birthdaysToday.length === 0) return;

    const names = birthdaysToday.map(e => e.name).filter(Boolean).join(', ');
    const msg = `🎂 ${names} ka aaj birthday hai! Wish karo!`;

    globalStaff.forEach(emp => {
      addEmpNotif(emp.name, {
        type: 'birthday',
        title: 'Birthday Alert',
        body: msg,
        time: 'Today',
        color: 'var(--orange)'
      });
    });
  }, [globalStaff, lastBirthdayCheck, addEmpNotif]);

  const sharedProps = {
    geoSettings,
    globalStaff,
    setGlobalStaff,
    globalLeaves,
    setGlobalLeaves,
    globalActivity,
    setGlobalActivity,
    globalBranches,
    setGlobalBranches,
    globalReimb,
    setGlobalReimb,
    salarySettings,
    setSalarySettings,
    salaryData,
    setSalaryData,
    empNotifs,
    addEmpNotif,
    yearlyHolidays,
    setYearlyHolidays
  };
  const offlineBanner = !backendOnline ? /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#ffefef',
      color: '#8a1d1d',
      border: '1px solid #f5c2c2',
      padding: '10px 14px',
      textAlign: 'center',
      fontSize: 12,
      fontWeight: 700
    }
  }, "Backend unavailable. Frontend is still available in offline mode.") : null;
  if (!user) {
    return /*#__PURE__*/React.createElement(React.Fragment, null, offlineBanner, /*#__PURE__*/React.createElement(Login, {
      onLogin: setUser
    }));
  }

  const logoutHandler = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userAuth');
    }
    setUser(null);
  };

  const panelProps = {
    user,
    onLogout: logoutHandler,
    ...sharedProps
  };

  let panel = /*#__PURE__*/React.createElement(EmpPanel, panelProps);

  if (user.role === 'superadmin') {
    panel = /*#__PURE__*/React.createElement(SAPanel, {
      ...panelProps,
      setGeoSettings: setGeoSettings
    });
  } else if (user.role === 'hr' || user.role === 'admin') {
    panel = /*#__PURE__*/React.createElement(HRPanel, panelProps);
  }

  return /*#__PURE__*/React.createElement(React.Fragment, null, offlineBanner, panel);
};

export default App;
