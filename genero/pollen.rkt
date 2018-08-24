#lang racket/base

(require pollen/decode)
(require pollen/tag)
(require pollen/unstable/typography)
(require txexpr)
(require racket/string)
(require racket/list)
(require pollen/core)
(require pollen/template)

(provide (all-defined-out))

;; (define (root . elements)
;;    (txexpr 'root null (decode-elements elements
;;      #:txexpr-elements-proc decode-paragraphs
;;      #:string-proc (compose smart-quotes smart-dashes))))

(define (link url . words)
  `(a [[href ,url]] ,@words))

(define (codeblock . elements)
  `(pre [[class "code"]] ,@elements))

(define (blockquote source . words)
  `(blockquote ,@words
               (footer ,source)))

(define (sidenote . elements)
  (let ([snid (number->string (random 10000000))])
    `(span (label ((for ,snid) (class "margin-toggle sidenote-number")))
           (input ((type "checkbox")
                   (id ,snid)
                   (class "margin-toggle")))
           (span ((class "sidenote"))
                 ,@elements)
           ))
  )

(define (marginnote . elements)
  (let ([mnid (number->string (random 10000000))])
    `(span (label ((for ,mnid) (class "margin-toggle"))
                  "+")
           (input ((type "checkbox")
                   (id ,mnid)
                   (class "margin-toggle")))
           (span ((class "marginnote"))
                 ,@elements)
           ))
  )

(define (newthought . elements)
  `(span [[class "newthought"]] ,@elements))

(define (sans . elements)
  `(p [[class "sans"]] ,@elements))

(define (epigraph . elements)
  `(div [[class "epigraph"]] ,@elements))

(define (image url . description)
  `(img [[src ,url][alt ,@description]]))

(define (figurefull . elements)
  `(figure [[class "fullwidth"]] ,@elements))

(define (time . elements)
  `(h3 ,@elements))

(define (voice source . words)
  `(blockquote ,@words
               (footer ,source)))
(define noise
  `(span [[class "noise"]] "[...]"))

(define (profile url . description)
  `(img [[src ,url][alt ,@description][class "profile"]]))

(define (card . elements)
  `(div [[class "card"]] ,@elements))

(define (cardtitle . elements)
  `(p [[class "cardtitle"]] ,@elements))

(define (citetitle . elements)
  `(span [[class "citetitle"]] "“" ,@elements "”"))

(define (citation . elements)
  `(span [[class "citation"]] "“" ,@elements "”"))

(define (org . elements)
  `(span [[class "org"]] "”" ,@elements "”"))

(define (concept . elements)
  `(span [[class "concept"]] ,@elements))

(define (frase . elements)
  `(p [[class "sans frase"]] ,@elements))

(define (otherwords . elements)
    `(span [[class "inotherwords"]] "— " ,@elements " —"))

(define (acronym . elements)
  `(span [[class "acronym"]] " " ,@elements " "))

(define (make-toc) '(meta ((toc "true"))))

(define (root . xs)
  (define-values (_ headings)
    (splitf-txexpr `(root ,@xs)
                   (λ(x) (and (txexpr? x) (member (car x) '(h2))))))
  (define toc-entries (map heading->toc-entry headings))
  `(root
    (body ,@(decode-elements xs
                           #:txexpr-elements-proc decode-paragraphs
                           #:string-proc (compose smart-quotes smart-dashes)))
    (toc-entries ,@toc-entries)))

(define (heading->toc-entry heading)

  `(div [[class "entry"]]
        (a  [[href ,(string-append "#" (attr-ref heading 'id))]]
            ,@(get-elements heading))))

(define (table . elements)
  `(table ,@elements))

(define (flattable . elements)
  `(table [[class "noheader"]] ,@elements))

(define (tr . elements)
  `(tr ,@elements))

(define (th . elements)
  `(th ,@elements))

(define (td . elements)
  `(td ,@elements))

(define (simpletable . rows)
  `(table ,@(map (lambda (row)
                   `(tr ,@(map
                             (lambda (data) `(td ,data))
                             (string-split row ","))))
                 (string-split (string-append* rows) "\n"))))

(define (row  . columns)
  `(tr ,@(map
          (lambda (data) `(td ,@data))
          (split-by columns "\n")
          )))

(define (split-by lst x)
  (foldr (lambda (element next)
           (if (eqv? element x)
               (cons empty next)
               (cons (cons element (first next)) (rest next))))
         (list empty) lst))

(define (gender . elements)
  `(span [[class "gender"]]
         ,@(map
            (lambda (el order)
              (if (= order 1)
                  `(span ,el
                         (span [[class "gendersep"]] "|"))
                  `(span ,el)
                    ))
            (string-split (string-append* elements) "/")
            '(1 2)
            )))

(define (lectura cloudfront filename autor titulo formato peso)
  (let ([url (string-append "https://d2pki7gi42ldsh.cloudfront.net/wp-content/uploads/2018/08/" cloudfront "/" filename)])
    `(div [[class "lectura"]]
          (p ,autor)
          (a [[href ,url][target "_blank"][class "lecturalink"]] "“" ,titulo "”")
          (span [[class "lecturameta"]] ,formato ", " ,peso))))
