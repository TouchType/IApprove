(ns i-approve.core
	(:require [org.httpkit.server :refer :all]
						[compojure.core :refer :all]
						[compojure.route :as route]
						[compojure.handler :refer [api]]
						[ring.middleware.json :as middleware]
            [clojure.pprint :refer [pprint]]
						[cheshire.core :refer [generate-string parse-string]]))

(def listeners (atom {}))
(def clients (atom {}))

(defn tell!
  [who what]
  (println what)
  (doseq [connection @who]
    (send! (key connection)
           (generate-string what)
           false)))

(defn web-socket-handler [client-container on-receive-fn]
  (fn [request]
    (with-channel request channel
      (println "connected:" channel)
      (swap! client-container assoc channel true)
      (on-close   channel (fn [status]
                            (swap! client-container dissoc channel)
                            (println "disconnected:" channel "status:" status)))
      (on-receive channel (fn [data]
                            (when on-receive-fn
                              (on-receive-fn (parse-string data))))))))

(defroutes my-routes
  (GET "/i-approve" []
    (web-socket-handler clients (partial tell! listeners)))
  (GET "/who-approves" []
    (web-socket-handler listeners (partial tell! clients)))
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
  (tell! listeners {:approves {:who "mr. nobody" :comment (str "test " i)}})
  (recur (inc i))))
