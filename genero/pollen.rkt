#lang racket/base

(require pollen/decode)
(require pollen/tag)
(require pollen/unstable/typography)
(require txexpr)
(require racket/string)

(provide (all-defined-out))

(define (root . elements)
   (txexpr 'root null (decode-elements elements
     #:txexpr-elements-proc decode-paragraphs
     #:string-proc (compose smart-quotes smart-dashes))))

(define (title . elements)
  `(h1 ,@elements))

(define (subtitle . elements)
  `(p [[class "subtitle"]] ,@elements))

(define (link url . words)
  `(a [[href ,url]] ,@words))

(define (art . numero)
  (let ([url
         (string-append
          "https://procosi.github.io/nenes/convencion/?a=" (list-ref numero 0))])
    `(a [[href ,url]] ,@numero)))

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
