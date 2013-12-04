(defproject i-approve "0.1.0-SNAPSHOT"
  :description "Server for IApprove providing a 'Like' page and websocket to browser"
  :url "http://example.com/FIXME"
  :license {:name "Eclipse Public License"
            :url "http://www.eclipse.org/legal/epl-v10.html"}
  :dependencies [[org.clojure/clojure "1.5.1"]
                 [http-kit            "2.1.13"]
                 [cheshire            "5.2.0"]
                 [compojure 					"1.1.6"]
                 [ring/ring-json			"0.2.0"]
                 [javax.servlet/servlet-api "2.5"]]
  :main i-approve.core/run)
