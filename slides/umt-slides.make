#this file is in the root of the course
HOME_DIR =	$(patsubst %/,%, $(dir $(firstword $(MAKEFILE_LIST))))/..

#added only for zdu-umt2pdf
COURSE = 	$(shell basename $$(realpath $(HOME_DIR)))
zdu-umt2pdf =   zdu.binghamton.edu bin/zdu-umt2pdf
PWD=$(shell pwd)

TEMPLATE_DIR =  $(HOME_DIR)/assets/umt

UMT_FILES = $(wildcard ./*.umt)
UMT_BASES = $(subst .umt,,$(UMT_FILES))
HTML_FILES = $(subst .umt,.html,$(UMT_FILES)) 

#if we have an index.umt, generate only html, else both html + pdf
ifeq (./index.umt,$(wildcard ./index.umt))
  TARGETS = $(HTML_FILES)
else
  PDF_FILES = $(subst .umt,.pdf,$(UMT_FILES)) 
  TARGETS = $(PDF_FILES) $(HTML_FILES) 
endif


all:		$(TARGETS)

.phony:		clean

clean:
		rm -rf *~ $(UMT_BASES) $(TARGETS)

#added only for zdu-umt2pdf
tex-clean:
		rm -f *.tex *.log *.tex-log *.aux *.out

%.html:		%.umt
		umt -D HOME=$(HOME_DIR) -D umt/code/lang=js -d slides \
		  $(TEMPLATE_DIR)/slides-template.html $< $@

%.pdf:		%.umt
		ssh $(zdu-umt2pdf) $(COURSE) $(HOME_DIR) $(PWD) \
			           slides-template.tex $< $@ \
				   -d slides -D umt/code/lang=js

%.tex:		%.umt
		ssh $(zdu-umt2pdf) $(COURSE) $(HOME_DIR) $(PWD) \
		      	           slides-template.tex $< $@ \
				   -d slides -D umt/code/lang=js
# %.pdf:		%.umt
# 		umt -D HOME=$(HOME_DIR) -D umt/code/lang=js -d slides \
# 		  $(TEMPLATE_DIR)/slides-template.tex $< $@

# %.tex:		%.umt
# 		umt -D HOME=$(HOME_DIR) -D umt/code/lang=js -d slides \
# 		  $(TEMPLATE_DIR)/slides-template.tex $< $@
