from manim import Scene, Circle, Text, Create, Write, FadeOut, UP, BLUE


class Smoke(Scene):
    def construct(self):
        c = Circle(color=BLUE)
        t = Text("smoke test").next_to(c, UP)
        self.play(Create(c), Write(t), run_time=0.5)
        self.play(FadeOut(c), FadeOut(t), run_time=0.3)
