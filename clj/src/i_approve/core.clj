(ns i-approve.core
	(:require [org.httpkit.server :refer :all]
						[compojure.core :refer :all]
						[compojure.route :as route]
						[compojure.handler :refer [api]]
						[ring.middleware.json :as middleware]
            [clojure.pprint :refer [pprint]]
						[cheshire.core :refer [generate-string parse-string]]))

(def listeners (atom {}))

(defn approves
	[params]
	(println (:who params) "approves" "-" (str "\"" (:comment params) "\""))
  (doseq [client @listeners]
    (send! (key client)
    			 (generate-string {:approves params})
           false))
	{:body {:success true}})

(defn tab
  [params]
  (println "tab switch" (get params "tab-changed"))
    (doseq [client @listeners]
    (send! (key client)
           (generate-string {:tab (get params "tab-changed")})
           false)))
; TODO: have separate list of web clients,
;       update them with name of new tab,
;       use websocket to send "like" to server

(defn ws-listen [request]
  (with-channel request channel
    (println channel "connected" channel)
    (swap! listeners assoc channel true)
    (on-close channel (fn [status]
                        (swap! listeners dissoc channel)
                        (println channel "disconnected. status:" status)))
    (on-receive channel (fn [data]
                          (tab (parse-string data))))))

(defroutes my-routes
  (POST "/i-approve"
    {params :params} (approves params))
  (GET "/who-approves" []
  	ws-listen)
  (GET "/" []
  	(clojure.java.io/resource "public/index.html"))
  (route/resources "/")
  (route/not-found
  	"404 Page not found"))

(def app (-> (api my-routes)
						 (middleware/wrap-json-response)))

(defn run
	[]
	(let [port 9090]
		(println "Starting server on port" port)
		(run-server app {:port port})))

(future (loop [i 1]
  (Thread/sleep 6000)
  (approves {:who "nobody" :comment (str "test " i)})
  (recur (inc i))))
